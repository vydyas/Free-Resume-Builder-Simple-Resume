import { UserData } from '@/types/resume';

export const defaultResumeContent: UserData = {
  firstName: '',
  lastName: '',
  email: '',
  headline: 'Your Professional Headline',
  summary: '<p>Write a brief summary of your professional background, key skills, and career objectives. This section helps employers quickly understand who you are and what you bring to the table.</p>',
  location: '',
  phoneNumber: '',
  linkedinId: '',
  githubId: '',
  positions: [
    {
      title: 'Your Job Title',
      company: 'Company Name',
      startDate: 'Start Date',
      endDate: 'End Date',
      description: '<p>Describe your key responsibilities and achievements in this role. Use bullet points to highlight your accomplishments.</p>',
    },
  ],
  educations: [
    {
      schoolName: 'University or School Name',
      degree: 'Degree Type',
      fieldOfStudy: 'Field of Study',
      startDate: 'Start Date',
      endDate: 'End Date',
    },
  ],
  skills: [
    { name: 'Skill 1' },
    { name: 'Skill 2' },
    { name: 'Skill 3' },
    { name: 'Skill 4' },
  ],
  projects: [],
  certifications: [
    {
      title: 'Certification Name',
      organization: 'Issuing Organization',
      completionDate: 'Completion Date',
      description: 'Brief description of the certification',
    },
  ],
  customSections: [],
};

