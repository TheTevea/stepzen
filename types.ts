export interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Remote' | 'Hybrid' | 'Onsite';
  category: 'Frontend' | 'Backend' | 'Fullstack' | 'Design' | 'Mobile' | 'Data';
  postedDate: string;
  deadline: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  duration?: string;
  stipend?: string;
  telegramApplyLink: string;
}

export interface FilterState {
  search: string;
  location: string;
  type: string;
  category: string;
  sort: 'newest' | 'deadline' | 'alpha';
}