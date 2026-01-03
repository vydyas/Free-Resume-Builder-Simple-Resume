import { supabaseAdmin } from './supabase-server';
import {
  clientPositionToDb,
  clientEducationToDb,
  clientSkillToDb,
  clientProjectToDb,
  clientCertificationToDb,
  Position,
  Education,
  Skill,
  Project,
  Certification,
} from '@/lib/resume-sections-utils';

/**
 * Update resume sections in normalized tables
 */
export async function updateResumeSections(
  resumeId: string,
  sections: {
    positions?: Position[];
    educations?: Education[];
    skills?: Skill[];
    projects?: Project[];
    certifications?: Certification[];
  }
) {
  // Update positions
  if (sections.positions !== undefined) {
    // Delete existing positions
    await supabaseAdmin
      .from('resume_positions')
      .delete()
      .eq('resume_id', resumeId);

    // Insert new positions
    if (sections.positions.length > 0) {
      const positionsToInsert = sections.positions.map((pos, index) => ({
        resume_id: resumeId,
        ...clientPositionToDb(pos),
        display_order: pos.displayOrder ?? index,
      }));

      const { error } = await supabaseAdmin
        .from('resume_positions')
        .insert(positionsToInsert);

      if (error) throw error;
    }
  }

  // Update educations
  if (sections.educations !== undefined) {
    await supabaseAdmin
      .from('resume_educations')
      .delete()
      .eq('resume_id', resumeId);

    if (sections.educations.length > 0) {
      const educationsToInsert = sections.educations.map((edu, index) => ({
        resume_id: resumeId,
        ...clientEducationToDb(edu),
        display_order: edu.displayOrder ?? index,
      }));

      const { error } = await supabaseAdmin
        .from('resume_educations')
        .insert(educationsToInsert);

      if (error) throw error;
    }
  }

  // Update skills
  if (sections.skills !== undefined) {
    await supabaseAdmin
      .from('resume_skills')
      .delete()
      .eq('resume_id', resumeId);

    if (sections.skills.length > 0) {
      const skillsToInsert = sections.skills.map((skill, index) => ({
        resume_id: resumeId,
        ...clientSkillToDb(skill),
        display_order: skill.displayOrder ?? index,
      }));

      const { error } = await supabaseAdmin
        .from('resume_skills')
        .insert(skillsToInsert);

      if (error) throw error;
    }
  }

  // Update projects
  if (sections.projects !== undefined) {
    await supabaseAdmin
      .from('resume_projects')
      .delete()
      .eq('resume_id', resumeId);

    if (sections.projects.length > 0) {
      const projectsToInsert = sections.projects.map((proj, index) => ({
        resume_id: resumeId,
        ...clientProjectToDb(proj),
        display_order: proj.displayOrder ?? index,
      }));

      const { error } = await supabaseAdmin
        .from('resume_projects')
        .insert(projectsToInsert);

      if (error) throw error;
    }
  }

  // Update certifications
  if (sections.certifications !== undefined) {
    await supabaseAdmin
      .from('resume_certifications')
      .delete()
      .eq('resume_id', resumeId);

    if (sections.certifications.length > 0) {
      const certificationsToInsert = sections.certifications.map((cert, index) => ({
        resume_id: resumeId,
        ...clientCertificationToDb(cert),
        display_order: cert.displayOrder ?? index,
      }));

      const { error } = await supabaseAdmin
        .from('resume_certifications')
        .insert(certificationsToInsert);

      if (error) throw error;
    }
  }

  return { success: true };
}



