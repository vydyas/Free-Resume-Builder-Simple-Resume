/**
 * Utility functions for working with normalized resume sections
 * These functions help convert between the old JSONB format and new table-based format
 */

export interface Position {
  id?: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
  displayOrder?: number;
}

export interface Education {
  id?: string;
  schoolName: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  displayOrder?: number;
}

export interface Skill {
  id?: string;
  name: string;
  displayOrder?: number;
}

export interface Project {
  id?: string;
  title: string;
  link: string;
  description: string;
  displayOrder?: number;
}

export interface Certification {
  id?: string;
  title: string;
  organization: string;
  completionDate: string;
  description?: string;
  credentialUrl?: string;
  displayOrder?: number;
}

/**
 * Database row type for position
 */
interface PositionRow {
  id: string;
  title: string;
  company: string;
  start_date: string;
  end_date: string;
  description: string | null;
  display_order: number | null;
}

/**
 * Convert database position row to client format
 */
export function dbPositionToClient(row: PositionRow): Position {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    startDate: row.start_date,
    endDate: row.end_date,
    description: row.description || '',
    displayOrder: row.display_order ?? undefined,
  };
}

/**
 * Database format for position
 */
interface PositionDb {
  title: string;
  company: string;
  start_date: string;
  end_date: string;
  description: string;
  display_order: number;
}

/**
 * Convert client position to database format
 */
export function clientPositionToDb(position: Position): PositionDb {
  return {
    title: position.title,
    company: position.company,
    start_date: position.startDate,
    end_date: position.endDate,
    description: position.description,
    display_order: position.displayOrder ?? 0,
  };
}

/**
 * Database row type for education
 */
interface EducationRow {
  id: string;
  school_name: string;
  degree: string | null;
  field_of_study: string | null;
  start_date: string;
  end_date: string;
  display_order: number | null;
}

/**
 * Convert database education row to client format
 */
export function dbEducationToClient(row: EducationRow): Education {
  return {
    id: row.id,
    schoolName: row.school_name,
    degree: row.degree || '',
    fieldOfStudy: row.field_of_study || '',
    startDate: row.start_date,
    endDate: row.end_date,
    displayOrder: row.display_order ?? undefined,
  };
}

/**
 * Database format for education
 */
interface EducationDb {
  school_name: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  display_order: number;
}

/**
 * Convert client education to database format
 */
export function clientEducationToDb(education: Education): EducationDb {
  return {
    school_name: education.schoolName,
    degree: education.degree,
    field_of_study: education.fieldOfStudy,
    start_date: education.startDate,
    end_date: education.endDate,
    display_order: education.displayOrder ?? 0,
  };
}

/**
 * Database row type for skill
 */
interface SkillRow {
  id: string;
  name: string;
  display_order: number | null;
}

/**
 * Convert database skill row to client format
 */
export function dbSkillToClient(row: SkillRow): Skill {
  return {
    id: row.id,
    name: row.name,
    displayOrder: row.display_order ?? undefined,
  };
}

/**
 * Database format for skill
 */
interface SkillDb {
  name: string;
  display_order: number;
}

/**
 * Convert client skill to database format
 */
export function clientSkillToDb(skill: Skill): SkillDb {
  return {
    name: skill.name,
    display_order: skill.displayOrder ?? 0,
  };
}

/**
 * Database row type for project
 */
interface ProjectRow {
  id: string;
  title: string;
  link: string | null;
  description: string | null;
  display_order: number | null;
}

/**
 * Convert database project row to client format
 */
export function dbProjectToClient(row: ProjectRow): Project {
  return {
    id: row.id,
    title: row.title,
    link: row.link || '',
    description: row.description || '',
    displayOrder: row.display_order ?? undefined,
  };
}

/**
 * Database format for project
 */
interface ProjectDb {
  title: string;
  link: string | null;
  description: string;
  display_order: number;
}

/**
 * Convert client project to database format
 */
export function clientProjectToDb(project: Project): ProjectDb {
  return {
    title: project.title,
    link: project.link || null,
    description: project.description,
    display_order: project.displayOrder ?? 0,
  };
}

/**
 * Database row type for certification
 */
interface CertificationRow {
  id: string;
  title: string;
  organization: string;
  completion_date: string;
  description: string | null;
  credential_url: string | null;
  display_order: number | null;
}

/**
 * Convert database certification row to client format
 */
export function dbCertificationToClient(row: CertificationRow): Certification {
  return {
    id: row.id,
    title: row.title,
    organization: row.organization,
    completionDate: row.completion_date,
    description: row.description || undefined,
    credentialUrl: row.credential_url || undefined,
    displayOrder: row.display_order ?? undefined,
  };
}

/**
 * Database format for certification
 */
interface CertificationDb {
  title: string;
  organization: string;
  completion_date: string;
  description: string | null;
  credential_url: string | null;
  display_order: number;
}

/**
 * Convert client certification to database format
 */
export function clientCertificationToDb(certification: Certification): CertificationDb {
  return {
    title: certification.title,
    organization: certification.organization,
    completion_date: certification.completionDate,
    description: certification.description || null,
    credential_url: certification.credentialUrl || null,
    display_order: certification.displayOrder ?? 0,
  };
}



