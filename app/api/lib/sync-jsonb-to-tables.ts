import { supabaseAdmin } from './supabase-server';
import {
  clientPositionToDb,
  clientEducationToDb,
  Position,
  Education,
} from '@/lib/resume-sections-utils';

/**
 * Sync Personal Information from resumes table to resume_personal_info table
 * This enables filtering while keeping JSONB as primary storage
 */
export async function syncPersonalInfoToTable(resumeId: string, personalInfo: {
  firstName?: string;
  lastName?: string;
  email?: string;
  headline?: string;
  summary?: string;
  location?: string;
  phoneNumber?: string;
  linkedinId?: string;
  githubId?: string;
}) {
  // Upsert personal info to normalized table
  const { error } = await supabaseAdmin
    .from('resume_personal_info')
    .upsert({
      resume_id: resumeId,
      first_name: personalInfo.firstName,
      last_name: personalInfo.lastName,
      email: personalInfo.email,
      headline: personalInfo.headline,
      summary: personalInfo.summary,
      location: personalInfo.location,
      phone_number: personalInfo.phoneNumber,
      linkedin_id: personalInfo.linkedinId,
      github_id: personalInfo.githubId,
    }, {
      onConflict: 'resume_id',
    });

  if (error) {
    console.error('Error syncing personal info to table:', error);
    throw error;
  }
}

/**
 * Sync Positions from JSONB to resume_positions table
 * This enables filtering while keeping JSONB as primary storage
 */
export async function syncPositionsToTable(resumeId: string, positions: Position[]) {
  // Delete existing positions for this resume
  await supabaseAdmin
    .from('resume_positions')
    .delete()
    .eq('resume_id', resumeId);

  // Insert new positions
  if (positions && positions.length > 0) {
    const positionsToInsert = positions.map((pos, index) => ({
      resume_id: resumeId,
      ...clientPositionToDb(pos),
      display_order: pos.displayOrder ?? index,
    }));

    const { error } = await supabaseAdmin
      .from('resume_positions')
      .insert(positionsToInsert);

    if (error) {
      console.error('Error syncing positions to table:', error);
      throw error;
    }
  }
}

/**
 * Sync Educations from JSONB to resume_educations table
 * This enables filtering while keeping JSONB as primary storage
 */
export async function syncEducationsToTable(resumeId: string, educations: Education[]) {
  // Delete existing educations for this resume
  await supabaseAdmin
    .from('resume_educations')
    .delete()
    .eq('resume_id', resumeId);

  // Insert new educations
  if (educations && educations.length > 0) {
    const educationsToInsert = educations.map((edu, index) => ({
      resume_id: resumeId,
      ...clientEducationToDb(edu),
      display_order: edu.displayOrder ?? index,
    }));

    const { error } = await supabaseAdmin
      .from('resume_educations')
      .insert(educationsToInsert);

    if (error) {
      console.error('Error syncing educations to table:', error);
      throw error;
    }
  }
}

/**
 * Sync all JSONB data to normalized tables
 * Called when Personal Info, Experience, or Education is updated
 */
export async function syncJsonbSectionsToTables(
  resumeId: string,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    headline?: string;
    summary?: string;
    location?: string;
    phoneNumber?: string;
    linkedinId?: string;
    githubId?: string;
    positions?: Position[];
    educations?: Education[];
  }
) {
  const syncPromises: Promise<void>[] = [];

  // Sync personal info if any personal info fields are present
  if (
    data.firstName !== undefined ||
    data.lastName !== undefined ||
    data.email !== undefined ||
    data.headline !== undefined ||
    data.summary !== undefined ||
    data.location !== undefined ||
    data.phoneNumber !== undefined ||
    data.linkedinId !== undefined ||
    data.githubId !== undefined
  ) {
    syncPromises.push(
      syncPersonalInfoToTable(resumeId, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        headline: data.headline,
        summary: data.summary,
        location: data.location,
        phoneNumber: data.phoneNumber,
        linkedinId: data.linkedinId,
        githubId: data.githubId,
      })
    );
  }

  // Sync positions if provided
  if (data.positions !== undefined) {
    syncPromises.push(syncPositionsToTable(resumeId, data.positions));
  }

  // Sync educations if provided
  if (data.educations !== undefined) {
    syncPromises.push(syncEducationsToTable(resumeId, data.educations));
  }

  // Execute all syncs in parallel
  await Promise.all(syncPromises);
}



