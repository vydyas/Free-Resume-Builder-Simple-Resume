import { useEffect, useRef, useCallback } from 'react';
import { UserData } from '@/types/resume';
import { createClient } from '@/lib/supabase';
import { useDebouncedCallback } from 'use-debounce';

const SYNC_INTERVAL = 3000; // Auto-sync every 3 seconds
const STORAGE_KEY = 'resumeData';

interface SyncStatus {
  isSyncing: boolean;
  lastSyncedAt: number | null;
  error: string | null;
}

/**
 * Hook to sync resume data between localStorage and Supabase
 * Implements conflict resolution and debounced auto-save
 */
export function useResumeSync(
  resumeId: string | null,
  userData: UserData,
  onError?: (error: string) => void
) {
  const supabase = createClient();
  const syncStatusRef = useRef<SyncStatus>({
    isSyncing: false,
    lastSyncedAt: null,
    error: null,
  });
  const syncTimerRef = useRef<NodeJS.Timeout>();
  const lastLocalChangeRef = useRef<number>(Date.now());

  /**
   * Sync local data to Supabase (cloud save)
   */
  const syncToCloud = useCallback(
    async (data: UserData) => {
      if (!resumeId || syncStatusRef.current.isSyncing) {
        return;
      }

      syncStatusRef.current.isSyncing = true;

      try {
        const { error } = await supabase
          .from('resumes')
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            phone_number: data.phoneNumber,
            headline: data.headline,
            summary: data.summary,
            location: data.location,
            linkedin_id: data.linkedinId,
            github_id: data.githubId,
            positions: data.positions,
            educations: data.educations,
            skills: data.skills,
            projects: data.projects,
            certifications: data.certifications,
            custom_sections: data.customSections,
            updated_at: new Date().toISOString(),
          })
          .eq('id', resumeId);

        if (error) {
          throw error;
        }

        syncStatusRef.current.lastSyncedAt = Date.now();
        syncStatusRef.current.error = null;
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Failed to sync to cloud';
        syncStatusRef.current.error = errorMsg;
        console.error('[ResumeSync] Cloud sync failed:', error);
        onError?.(errorMsg);
      } finally {
        syncStatusRef.current.isSyncing = false;
      }
    },
    [resumeId, supabase, onError]
  );

  /**
   * Save to localStorage (local backup)
   */
  const saveToLocalStorage = useCallback((data: UserData) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        lastLocalChangeRef.current = Date.now();
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Failed to save to local storage';
      if (
        error instanceof Error &&
        error.name === 'QuotaExceededError'
      ) {
        syncStatusRef.current.error = 'Storage quota exceeded';
        onError?.(
          'Local storage is full. Please clean up old data or delete some sections.'
        );
      } else {
        syncStatusRef.current.error = errorMsg;
        onError?.(errorMsg);
      }
      console.error('[ResumeSync] localStorage save failed:', error);
    }
  }, [onError]);

  /**
   * Debounced cloud sync - waits for user to finish typing
   */
  const debouncedCloudSync = useDebouncedCallback(
    (data: UserData) => {
      syncToCloud(data);
    },
    1000 // Wait 1 second after last change
  );

  /**
   * Auto-sync periodically to cloud
   */
  useEffect(() => {
    syncTimerRef.current = setInterval(() => {
      if (resumeId && !syncStatusRef.current.isSyncing) {
        syncToCloud(userData);
      }
    }, SYNC_INTERVAL);

    return () => {
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
      }
    };
  }, [resumeId, userData, syncToCloud]);

  /**
   * Save to localStorage on every change (local backup)
   * Cloud sync happens via debounce
   */
  useEffect(() => {
    saveToLocalStorage(userData);
    debouncedCloudSync(userData);
  }, [userData, saveToLocalStorage, debouncedCloudSync]);

  /**
   * Sync on app close/tab close
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Final sync attempt
      syncToCloud(userData);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userData, syncToCloud]);

  /**
   * Get current sync status
   */
  const getSyncStatus = useCallback(() => ({
    ...syncStatusRef.current,
  }), []);

  return {
    syncToCloud,
    saveToLocalStorage,
    getSyncStatus,
  };
}

/**
 * Load resume data from storage (localStorage first, then cloud)
 */
export async function loadResumeData(
  resumeId: string | null,
  fallbackData: UserData
): Promise<UserData> {
  // Try localStorage first (faster)
  if (typeof window !== 'undefined') {
    try {
      const localData = localStorage.getItem(STORAGE_KEY);
      if (localData) {
        return JSON.parse(localData);
      }
    } catch (error) {
      console.error('[ResumeSync] Failed to load from localStorage:', error);
      // Continue to cloud load
    }
  }

  // Try cloud
  if (resumeId) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .single();

      if (error) throw error;
      if (data) {
        // Reconstruct UserData from database
        const userData: UserData = {
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          email: data.email || '',
          phoneNumber: data.phone_number || '',
          headline: data.headline || '',
          summary: data.summary || '',
          location: data.location || '',
          linkedinId: data.linkedin_id || '',
          githubId: data.github_id || '',
          positions: data.positions || [],
          educations: data.educations || [],
          skills: data.skills || [],
          projects: data.projects || [],
          certifications: data.certifications || [],
          customSections: data.custom_sections || [],
        };
        return userData;
      }
    } catch (error) {
      console.error('[ResumeSync] Failed to load from cloud:', error);
    }
  }

  return fallbackData;
}
