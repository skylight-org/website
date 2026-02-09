import React from 'react';
import { Link } from 'react-router-dom';

interface MethodPreviewCardProps {
  id: string;
  title: string;
  description: string;
  previewContent: React.ReactNode;
  route: string;
  status?: 'stable' | 'beta' | 'coming-soon';
}

/**
 * MethodPreviewCard displays a preview of a research method on the Welcome page.
 * 
 * Single Responsibility: Presents a method with preview content and navigation link
 * 
 * Usage: Display method previews on the landing page with consistent styling
 */
export const MethodPreviewCard: React.FC<MethodPreviewCardProps> = ({
  id,
  title,
  description,
  previewContent,
  route,
  status = 'stable'
}) => {
  const isComingSoon = status === 'coming-soon';
  const isBeta = status === 'beta';

  return (
    <div 
      className="bg-dark-surface border border-dark-border rounded-lg p-6 hover:border-accent-gold/50 transition-colors"
      id={`method-${id}`}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          {isBeta && (
            <span className="px-2 py-1 text-xs font-mono bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded">
              BETA
            </span>
          )}
          {isComingSoon && (
            <span className="px-2 py-1 text-xs font-mono bg-gray-700/20 text-gray-400 border border-gray-600/30 rounded">
              COMING SOON
            </span>
          )}
        </div>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </div>

      {/* Preview Content */}
      <div className="mb-6">
        {previewContent}
      </div>

      {/* Action Button */}
      {!isComingSoon ? (
        <Link
          to={route}
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent-gold text-dark-bg font-semibold rounded-lg hover:bg-accent-gold-hover transition-colors"
        >
          Explore Method
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <button
          disabled
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700/20 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
        >
          Coming Soon
        </button>
      )}
    </div>
  );
};
