import { Internship } from './types';

export const INTERNSHIPS: Internship[] = [
  {
    id: '1',
    title: 'Frontend React Engineer',
    company: 'PixelPerfect',
    location: 'San Francisco, CA',
    type: 'Remote',
    category: 'Frontend',
    postedDate: '2023-10-25',
    deadline: '2023-11-15',
    summary: 'Build beautiful UIs using React and Tailwind CSS for a fast-growing design agency.',
    responsibilities: [
      'Develop responsive web applications using React.',
      'Collaborate with designers to implement pixel-perfect UIs.',
      'Optimize application for maximum speed and scalability.'
    ],
    requirements: [
      'Strong proficiency in JavaScript and ES6+.',
      'Experience with React.js workflows.',
      'Familiarity with RESTful APIs.'
    ],
    skills: ['React', 'TypeScript', 'Tailwind', 'Figma'],
    duration: '6 months',
    stipend: '$3000/month',
    telegramApplyLink: 'https://t.me/+xYrIev4OEHk2MTY1'
  },
  {
    id: '2',
    title: 'Backend Node.js Intern',
    company: 'ServerSide Solutions',
    location: 'New York, NY',
    type: 'Hybrid',
    category: 'Backend',
    postedDate: '2023-10-20',
    deadline: '2023-11-01',
    summary: 'Dive deep into scalable APIs and microservices architecture.',
    responsibilities: [
      'Assist in the design and implementation of low-latency applications.',
      'Implement security and data protection.',
      'Integrate data storage solutions (Postgres, Redis).'
    ],
    requirements: [
      'Basic understanding of Node.js and Express.',
      'Knowledge of SQL databases.',
      'Understanding of fundamental design principles.'
    ],
    skills: ['Node.js', 'PostgreSQL', 'Docker', 'AWS'],
    duration: '3 months',
    stipend: '$2500/month',
    telegramApplyLink: 'https://t.me/+xYrIev4OEHk2MTY1'
  },
  {
    id: '3',
    title: 'UI/UX Design Intern',
    company: 'Creative Clouds',
    location: 'Austin, TX',
    type: 'Remote',
    category: 'Design',
    postedDate: '2023-10-28',
    deadline: '2023-11-20',
    summary: 'Design intuitive user experiences and create stunning visuals for mobile apps.',
    responsibilities: [
      'Create wireframes, storyboards, user flows, and site maps.',
      'Conduct user research and evaluate user feedback.',
      'Establish and promote design guidelines.'
    ],
    requirements: [
      'Portfolio demonstrating UI/UX skills.',
      'Proficiency in Figma or Adobe XD.',
      'Excellent visual design skills.'
    ],
    skills: ['Figma', 'Prototyping', 'User Research'],
    duration: '4 months',
    stipend: '$2000/month',
    telegramApplyLink: 'https://t.me/+xYrIev4OEHk2MTY1'
  },
  {
    id: '4',
    title: 'Fullstack Developer',
    company: 'StartupX',
    location: 'London, UK',
    type: 'Onsite',
    category: 'Fullstack',
    postedDate: '2023-10-22',
    deadline: '2023-11-10',
    summary: 'Work across the entire stack from DB to UI in a fast-paced startup environment.',
    responsibilities: [
      'Develop and maintain web services and interfaces.',
      'Contribute to front-end and back-end architecture.',
      'Write clean, maintainable code.'
    ],
    requirements: [
      'Experience with the MERN stack.',
      'Understanding of version control (Git).',
      'Problem-solving mindset.'
    ],
    skills: ['MongoDB', 'Express', 'React', 'Node.js'],
    duration: '6 months',
    stipend: '£2200/month',
    telegramApplyLink: 'https://t.me/+xYrIev4OEHk2MTY1'
  },
  {
    id: '5',
    title: 'Mobile App Developer',
    company: 'Appify',
    location: 'Toronto, Canada',
    type: 'Remote',
    category: 'Mobile',
    postedDate: '2023-10-26',
    deadline: '2023-11-18',
    summary: 'Build cross-platform mobile applications using React Native.',
    responsibilities: [
      'Build pixel-perfect, buttery smooth UIs across both mobile platforms.',
      'Leverage native APIs for deep integrations.',
      'Diagnose and fix bugs and performance bottlenecks.'
    ],
    requirements: [
      'Familiarity with React Native.',
      'Understanding of REST APIs.',
      'Experience with native build tools (Xcode, Gradle) is a plus.'
    ],
    skills: ['React Native', 'iOS', 'Android', 'Redux'],
    duration: '4 months',
    stipend: '$2800/month',
    telegramApplyLink: 'https://t.me/+xYrIev4OEHk2MTY1'
  },
  {
    id: '6',
    title: 'Data Science Intern',
    company: 'DataMinds',
    location: 'Boston, MA',
    type: 'Hybrid',
    category: 'Data',
    postedDate: '2023-10-15',
    deadline: '2023-10-31',
    summary: 'Analyze large datasets to derive actionable insights for business growth.',
    responsibilities: [
      'Process, cleanse, and verify the integrity of data.',
      'Perform exploratory data analysis.',
      'Build predictive models using machine learning algorithms.'
    ],
    requirements: [
      'Strong math and statistical skills.',
      'Proficiency in Python and libraries like Pandas, Scikit-learn.',
      'Experience with SQL.'
    ],
    skills: ['Python', 'SQL', 'Machine Learning', 'Pandas'],
    duration: '3 months',
    stipend: '$3500/month',
    telegramApplyLink: 'https://t.me/+xYrIev4OEHk2MTY1'
  },
    {
    id: '7',
    title: 'DevOps Junior',
    company: 'CloudScale',
    location: 'Berlin, Germany',
    type: 'Remote',
    category: 'Backend',
    postedDate: '2023-10-29',
    deadline: '2023-11-25',
    summary: 'Help us automate deployment pipelines and manage cloud infrastructure.',
    responsibilities: [
      'Maintain CI/CD pipelines.',
      'Monitor system performance and reliability.',
      'Assist in cloud infrastructure management.'
    ],
    requirements: [
      'Basic Linux system administration skills.',
      'Understanding of containerization (Docker).',
      'Scripting skills (Bash/Python).'
    ],
    skills: ['Docker', 'Kubernetes', 'CI/CD', 'Linux'],
    duration: '6 months',
    stipend: '€2000/month',
    telegramApplyLink: 'https://t.me/+xYrIev4OEHk2MTY1'
  },
  {
    id: '8',
    title: 'Frontend Vue Developer',
    company: 'VueMastery',
    location: 'Paris, France',
    type: 'Hybrid',
    category: 'Frontend',
    postedDate: '2023-10-30',
    deadline: '2023-11-30',
    summary: 'Create engaging interactive experiences using Vue.js 3.',
    responsibilities: [
      'Develop user-facing features.',
      'Build reusable code and libraries.',
      'Ensure technical feasibility of UI/UX designs.'
    ],
    requirements: [
      'Proficiency in Vue.js and ecosystem.',
      'Good understanding of HTML5 and CSS3.',
      'Experience with state management (Pinia/Vuex).'
    ],
    skills: ['Vue.js', 'JavaScript', 'SASS', 'Git'],
    duration: '5 months',
    stipend: '€1800/month',
    telegramApplyLink: 'https://t.me/+xYrIev4OEHk2MTY1'
  },
];