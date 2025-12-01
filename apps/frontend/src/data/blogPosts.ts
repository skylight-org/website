export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  authors: { name: string; url?: string }[];
  affiliations: string[];
  date: string;
  readTime: string;
  summary: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'introducing-skylight',
    title: 'Introducing Sky-Light: Advancing the frontier of sparse attention research',
    authors: [
      { name: 'Aditya Desai' }, 
      { name: 'Kumar Krishna Agrawal' }, 
      { name: 'Luis Gaspar Schroeder' },
      { name: 'Prithvi Dixit' },
      { name: 'Matei Zaharia' },
      { name: 'Joseph E. Gonzalez' },
      { name: 'Ion Stoica' }
    ],
    affiliations: ['UC Berkeley'],
    date: 'Nov 25, 2025',
    readTime: '8 min',
    summary: 'The frontier of Large Language Models is shifting from simple text generation to complex reasoning tasks that require maintaining massive state. Introducing SkyLight, a framework to unify implementation, evaluation, and optimization of sparse attention.',
  }
];
