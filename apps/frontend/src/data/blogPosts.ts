export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  authors: { name: string; url?: string; affiliationIndices?: number[] }[];
  editors?: { name: string; url?: string; affiliationIndices?: number[] }[];
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
  },
  {
    id: '2',
    slug: 'vattention-baselines',
    title: 'vAttention: Redefining the Sparsity-Quality Frontier',
    authors: [
      { name: 'Aditya Desai', affiliationIndices: [1] }, 
      { name: 'Kumar Krishna Agrawal', affiliationIndices: [1] }, 
      { name: 'Shuo Yang', affiliationIndices: [1] },
      { name: 'Alejandro Cuadron', affiliationIndices: [1, 2] },
      { name: 'Luis Gaspar Schroeder', affiliationIndices: [1] },
      { name: 'Matei Zaharia', affiliationIndices: [1] },
      { name: 'Joseph E. Gonzalez', affiliationIndices: [1] },
      { name: 'Ion Stoica', affiliationIndices: [1] }
    ],
    editors: [
      { name: 'Aditya Desai' },
      { name: 'Kumar Krishna Agrawal' }
    ],
    affiliations: ['UC Berkeley', 'ETH Zurich'],
    date: 'Dec 4, 2025',
    readTime: '4 min',
    summary: 'vAttention establishes a new state-of-the-art on the SkyLight Tier-1A leaderboard, delivering >99% relative accuracy at high sparsity and proving that practical methods can outperform theoretical oracles.',
  }
];
