export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  authors: { name: string; url?: string }[];
  editors?: { name: string; url?: string }[];
  affiliations?: string[];
  authorAffiliations?: string[];
  editorAffiliations?: string[];
  date: string;
  readTime: string;
  summary: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: '3',
    slug: 'vattention',
    title: 'vAttention: Verified Sparse Attention',
    authors: [
      { name: 'Aditya Desai' },
      { name: 'Kumar Krishna Agrawal' },
      { name: 'Shuo Yang' },
      { name: 'Alejandro Cuadron' },
      { name: 'Luis Gaspar Schroeder' },
      { name: 'Matei Zaharia' },
      { name: 'Joseph E. Gonzalez' },
      { name: 'Ion Stoica' }
    ],
    editors: [
      { name: 'Kumar Krishna Agrawal' },
      { name: 'Aditya Desai' }
    ],
    authorAffiliations: ['UC Berkeley', 'ETH Zurich'],
    editorAffiliations: ['UC Berkeley'],
    date: 'Dec 18, 2025',
    readTime: '12 min',
    summary: 'Introducing vAttention, a verified sparse attention method that combines deterministic top-k selection with stochastic sampling to achieve state-of-the-art performance. Learn how this paradigm shift provides explicit error guarantees while dominating the sparsity-quality frontier.',
  },
  {
    id: '2',
    slug: 'pqcache',
    title: 'PQCache: Product Quantization-based KVCache for Long Context LLM Inference',
    authors: [
      { name: 'Hailin Zhang' },
      { name: 'Xiaodong Ji' },
      { name: 'Yilin Chen' },
      { name: 'Fangcheng Fu' },
      { name: 'Xupeng Miao' },
      { name: 'Xiaonan Nie' },
      { name: 'Weipeng Chen' },
      { name: 'Bin Cui' }
    ],
    editors: [
      { name: 'Aditya Desai' },
      { name: 'Kumar Krishna Agrawal' }
    ],
    authorAffiliations: ['Peking University', 'Purdue University'],
    editorAffiliations: ['UC Berkeley'],
    date: 'Dec 10, 2025',
    readTime: '10 min',
    summary: 'An in-depth look at PQCache, a product quantization method that establishes a new standard for practical, non-oracle algorithms on the SkyLight Tier-1A leaderboard. Learn how PQCache uses approximate top-k retrieval to efficiently identify important tokens for attention computation.',
  },
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
