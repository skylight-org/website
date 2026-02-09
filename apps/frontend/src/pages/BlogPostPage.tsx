import { useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { blogPosts } from '../data/blogPosts';
import { BlogAuthorHeader } from '../components/blog/BlogAuthorHeader';
import { IntroductionToSkyLightEntry } from './blog/IntroductionToSkyLightEntry';
import { PQCacheEntry } from './blog/PQCacheEntry';
import { VAttentionEntry } from './blog/VAttentionEntry';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();

  // Ensure we start at the top of the page when navigating to a blog post
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  // Map slug to content component
  const renderContent = () => {
    switch (slug) {
      case 'introducing-skylight':
        return <IntroductionToSkyLightEntry />;
      case 'pqcache':
        return <PQCacheEntry />;
      case 'vattention':
        return <VAttentionEntry />;
      default:
        return <div>Content not found</div>;
    }
  };

  return (
    <PageLayout spacing="none" maxWidth="full">
      <article>
        {/* Header Section */}
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold text-accent-gold font-quantico mb-6">
            {post.title}
          </h1>
          {post.subtitle && (
            <p className="text-xl text-gray-400 font-light mb-8">
              {post.subtitle}
            </p>
          )}

          {/* New 3-column Author Header */}
          <BlogAuthorHeader 
            authors={post.authors}
            editors={post.editors}
            affiliations={post.affiliations}
            authorAffiliations={post.authorAffiliations}
            editorAffiliations={post.editorAffiliations}
            publishedDate={post.date}
          />
        </div>

        {/* Main Content */}
        <div className="max-w-4xl">
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
      </article>
    </PageLayout>
  );
}
