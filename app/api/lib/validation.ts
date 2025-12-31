import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
function sanitizeHtml(value: string): string {
  if (typeof value !== 'string') return '';
  return DOMPurify.sanitize(value, { 
    ALLOWED_TAGS: [], // Allow no HTML tags, only text
    ALLOWED_ATTR: [] 
  });
}

/**
 * Transform string to sanitized version
 */
const sanitizedString = (fieldName: string = 'field') =>
  z.string()
    .max(5000, `${fieldName} must be less than 5000 characters`)
    .transform(sanitizeHtml);

/**
 * Transform email field
 */
const emailField = z.string()
  .email('Invalid email address')
  .max(255)
  .transform(s => s.toLowerCase().trim());

/**
 * Transform URL field
 */
const urlField = z.string()
  .url('Invalid URL')
  .max(2048)
  .optional()
  .or(z.literal(''));

// Resume validation schemas with sanitization
export const positionSchema = z.object({
  title: z.string().min(1).max(255).transform(sanitizeHtml),
  company: z.string().min(1).max(255).transform(sanitizeHtml),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, 'Date must be in YYYY-MM format'),
  endDate: z.string().regex(/^\d{4}-\d{2}$|^Present$/, 'Date must be in YYYY-MM format or "Present"'),
  description: sanitizedString('Description'),
});

export const educationSchema = z.object({
  schoolName: z.string().min(1).max(255).transform(sanitizeHtml),
  degree: z.string().max(255).transform(sanitizeHtml),
  fieldOfStudy: z.string().max(255).transform(sanitizeHtml),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, 'Date must be in YYYY-MM format').optional().or(z.literal('')),
  endDate: z.string().regex(/^\d{4}-\d{2}$|^Present$/, 'Date must be in YYYY-MM format or "Present"').optional().or(z.literal('')),
});

export const skillSchema = z.object({
  name: z.string().min(1).max(100).transform(sanitizeHtml),
});

export const projectSchema = z.object({
  title: z.string().min(1).max(255).transform(sanitizeHtml),
  link: urlField,
  description: sanitizedString('Project description'),
});

export const certificationSchema = z.object({
  title: z.string().min(1).max(255).transform(sanitizeHtml),
  organization: z.string().min(1).max(255).transform(sanitizeHtml),
  completionDate: z.string().regex(/^\d{4}-\d{2}$/, 'Date must be in YYYY-MM format'),
  description: sanitizedString('Certification description').optional(),
  credentialUrl: urlField,
});

export const customSectionSchema = z.object({
  id: z.string().uuid('Invalid section ID'),
  title: z.string().min(1).max(255).transform(sanitizeHtml),
  content: sanitizedString('Section content'),
  isVisible: z.boolean(),
});

export const resumeConfigSchema = z.object({
  showPhoto: z.boolean(),
  showSummary: z.boolean(),
  showExperience: z.boolean(),
  showEducation: z.boolean(),
  showSkills: z.boolean(),
  showProjects: z.boolean(),
  showRepositories: z.boolean(),
  showAwards: z.boolean(),
  showCertificates: z.boolean(),
  showLanguages: z.boolean(),
  showVolunteer: z.boolean(),
  showCertifications: z.boolean(),
}).strict(); // Reject unknown fields

export const createResumeSchema = z.object({
  name: z.string().max(255).transform(sanitizeHtml).optional(),
  firstName: z.string().max(100).transform(sanitizeHtml).optional(),
  lastName: z.string().max(100).transform(sanitizeHtml).optional(),
  email: emailField.optional(),
  headline: z.string().max(255).transform(sanitizeHtml).optional(),
  summary: sanitizedString('Summary').optional(),
  location: z.string().max(255).transform(sanitizeHtml).optional(),
  phoneNumber: z.string().max(20).regex(/^[+\d\s\-()]+$/, 'Invalid phone number').optional(),
  linkedinId: z.string().max(255).transform(sanitizeHtml).optional(),
  githubId: z.string().max(255).transform(sanitizeHtml).optional(),
  positions: z.array(positionSchema).max(20, 'Maximum 20 positions allowed').optional(),
  educations: z.array(educationSchema).max(10, 'Maximum 10 educations allowed').optional(),
  skills: z.array(skillSchema).max(100, 'Maximum 100 skills allowed').optional(),
  projects: z.array(projectSchema).max(20, 'Maximum 20 projects allowed').optional(),
  certifications: z.array(certificationSchema).max(20, 'Maximum 20 certifications allowed').optional(),
  customSections: z.array(customSectionSchema).max(10, 'Maximum 10 custom sections allowed').optional(),
  config: resumeConfigSchema.optional(),
  template: z.string().max(50).transform(sanitizeHtml).optional(),
  zoom: z.number().min(50).max(200).optional(),
}).strict(); // Reject unknown fields

export const updateResumeSchema = createResumeSchema.partial();
