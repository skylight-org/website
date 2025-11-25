export interface Author {
  name: string;
  url?: string;
}

export interface BlogHeaderInfo {
  authors: Author[];
  affiliations: string[];
  publishedDate: string;
}

export function BlogAuthorHeader({ authors, affiliations, publishedDate }: BlogHeaderInfo) {
  // Split authors into columns if there are many, or just list them
  // The design requested has a specific grid layout: Authors (left), Affiliation (middle), Published (right)
  
  return (
    <div className="border-t border-b border-gray-800 py-8 my-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm font-mono">
        {/* Column 1 & 2: Authors (Takes up more space) */}
        <div className="md:col-span-2">
          <h3 className="text-gray-500 text-xs uppercase tracking-wider mb-3">Authors</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            {authors.map((author, idx) => (
              <div key={idx} className="text-gray-300">
                {author.url ? (
                  <a href={author.url} className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                    {author.name}
                  </a>
                ) : (
                  author.name
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Affiliation */}
        <div>
          <h3 className="text-gray-500 text-xs uppercase tracking-wider mb-3">Affiliation</h3>
          <div className="space-y-2">
            {affiliations.map((affil, idx) => (
              <div key={idx} className="text-gray-300">{affil}</div>
            ))}
          </div>
        </div>

        {/* Column 4: Published */}
        <div>
          <h3 className="text-gray-500 text-xs uppercase tracking-wider mb-3">Published</h3>
          <div className="text-gray-300">{publishedDate}</div>
        </div>
      </div>
    </div>
  );
}

