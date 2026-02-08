import { Link } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { blogPosts } from '../data/blogPosts';

export function BlogPage() {
  const formatAuthors = (authors: { name: string }[]) => {
    if (authors.length <= 4) {
      return authors.map(a => a.name).join(', ');
    }
    return `${authors.slice(0, 4).map(a => a.name).join(', ')} et al.`;
  };

  return (
    <PageLayout spacing="normal" maxWidth="narrow">
        {/* Header Section */}
        <div className="mb-12 pb-6 border-b border-gray-800">
          <h1 className="text-4xl font-bold text-accent-gold mb-4 font-quantico">
            Sky Light Blog
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            Deep dives, tutorials, and research findings on sparse attention.
          </p>
        </div>
        
        {/* List of entries - Table-like layout */}
        <div className="w-full">
          {/* Table Header (Visible on desktop) */}
          <div className="hidden md:grid grid-cols-12 gap-4 pb-2 border-b border-gray-800 text-xs font-mono text-gray-500 uppercase tracking-wider mb-4">
            <div className="col-span-1">#</div>
            <div className="col-span-7">Title</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Read Time</div>
          </div>

          <div className="space-y-6 md:space-y-0">
            {blogPosts.map((post, index) => (
              <div key={post.id} className="group md:grid md:grid-cols-12 md:gap-4 md:py-4 md:border-b md:border-gray-800/50 items-baseline hover:bg-white/5 transition-colors -mx-4 px-4 rounded-lg md:rounded-none">
                
                {/* Index Number */}
                <div className="hidden md:block col-span-1 font-mono text-gray-500">
                  {String(index + 1).padStart(2, '0')}
                </div>

                {/* Title & Authors */}
                <div className="col-span-7">
                  <Link to={`/blog/${post.slug}`} className="block group-hover:text-accent-gold transition-colors">
                    <h2 className="text-xl font-semibold text-gray-100 mb-2 md:mb-1">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-gray-400 text-sm font-mono">
                    {formatAuthors(post.authors)}
                  </p>
                  
                  {/* Mobile Metadata */}
                  <div className="md:hidden mt-3 flex items-center gap-3 text-xs text-gray-500 font-mono">
                    <time>{post.date}</time>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>

                {/* Desktop Metadata */}
                <div className="hidden md:block col-span-2 text-sm text-gray-400 font-mono">
                  {post.date}
                </div>
                <div className="hidden md:block col-span-2 text-sm text-gray-400 font-mono">
                  {post.readTime}
                </div>
              </div>
            ))}
          </div>
        </div>
    </PageLayout>
  );
}
