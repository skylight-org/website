import { useRef } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';
import { BlogAuthorHeader } from '../components/blog/BlogAuthorHeader';
import { TableOfContents } from '../components/blog/TableOfContents';
import { IntroductionToSkyLightEntry } from '../components/blog/posts/IntroductionToSkyLightEntry';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find(p => p.slug === slug);
  const contentRef = useRef<HTMLDivElement>(null);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  // Map slug to content component
  const renderContent = () => {
    switch (slug) {
      case 'introducing-skylight':
        return <IntroductionToSkyLightEntry />;
      default:
        return <div>Content not found</div>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto pt-12 pb-24 px-4 md:px-8">
      {/* Minimal Back Link */}
      <Link 
        to="/blog"
        className="inline-block text-gray-500 hover:text-white mb-12 font-mono text-sm transition-colors"
      >
        ← Index
      </Link>

      <article>
        {/* Header Section */}
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
            {post.title}
          </h1>
          {post.subtitle && (
            <p className="text-xl text-gray-400 font-light mb-8">
              {post.subtitle}
            </p>
          )}
          
          <div className="text-gray-300 text-xl leading-relaxed mb-12 max-w-3xl font-light">
            {post.summary}
          </div>

          {/* New 3-column Author Header */}
          <BlogAuthorHeader 
            authors={post.authors}
            affiliations={post.affiliations}
            publishedDate={post.date}
          />
        </div>

        {/* Main Content Area with Sidebar Layout */}
        <div className="flex gap-16 relative">
          {/* Left Sidebar (Table of Contents) - Hidden on mobile */}
          <TableOfContents contentRef={contentRef} slug={slug} />

          {/* Main Content */}
          <div className="flex-1 min-w-0" ref={contentRef}>
            <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-loose">
              {renderContent()}
            </div>

            {/* Bottom navigation aid */}
            <div className="mt-24 pt-8 border-t border-gray-800 flex justify-between">
               <Link to="/blog" className="text-gray-500 hover:text-white font-mono text-sm">
                 Back to Index
               </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
