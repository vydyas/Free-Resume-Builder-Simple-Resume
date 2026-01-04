export interface ResumeConfig {
  showPhoto: boolean;
  showSummary: boolean;
  showExperience: boolean;
  showEducation: boolean;
  showSkills: boolean;
  showProjects: boolean;
  showCertifications: boolean;
  // Add other configuration options as needed
}

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  summary: string;
  location: string;
  phoneNumber: string;
  linkedinId: string;
  githubId: string;
  positions: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  educations: Array<{
    schoolName: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
  }>;
  skills: Array<{
    name: string;
  }>;
  projects: Array<{
    title: string;
    link: string;
    description: string;
  }>;
  certifications?: Array<{
    title: string;
    organization: string;
    completionDate: string;
    description?: string;
    credentialUrl?: string;
  }>;
  customSections?: Array<{
    id: string;
    title: string;
    content: string;
    isVisible: boolean;
  }>;
}

export type HeadingStyle = 'background' | 'border-bottom' | 'border-top'; // Define the possible styles 

export interface LineItem {
  id: string;
  content: React.ReactNode;
  type: string;
  section: string;
}