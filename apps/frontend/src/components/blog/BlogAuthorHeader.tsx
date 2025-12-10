export interface Author {
  name: string;
  url?: string;
}

export interface BlogHeaderInfo {
  authors: Author[];
  editors?: Author[];
  affiliations?: string[];
  authorAffiliations?: string[];
  editorAffiliations?: string[];
  publishedDate: string;
}

export function BlogAuthorHeader({ authors, editors, affiliations, authorAffiliations, editorAffiliations, publishedDate }: BlogHeaderInfo) {
  // Check if using separate affiliations
  const usingSeparateAffiliations = authorAffiliations || editorAffiliations;
  
  return (
    <div className="border-t border-b border-gray-800 py-8 my-12">
      {usingSeparateAffiliations ? (
        // New layout: Authors/Affiliations/Published side by side
        <div className="space-y-8 text-sm">
          {/* Authors, Author Affiliations, and Published Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Authors Column */}
            <div className="md:col-span-2">
              <h3 className="text-gray-500 text-xs uppercase tracking-wider mb-3 font-medium">Authors</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                {authors.map((author, idx) => (
                  <div key={idx} className="text-gray-300">
                    {author.url ? (
                      <a href={author.url} className="hover:text-accent-gold transition-colors" target="_blank" rel="noopener noreferrer">
                        {author.name}
                      </a>
                    ) : (
                      author.name
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Author Affiliations Column */}
            {authorAffiliations && authorAffiliations.length > 0 && (
              <div>
                <h3 className="text-gray-500 text-xs uppercase tracking-wider mb-3 font-medium">Affiliation</h3>
                <div className="space-y-2">
                  {authorAffiliations.map((affil, idx) => (
                    <div key={idx} className="text-gray-300">{affil}</div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Published Date Column */}
            <div>
              <h3 className="text-gray-500 text-xs uppercase tracking-wider mb-3 font-medium">Published</h3>
              <div className="text-gray-300">{publishedDate}</div>
            </div>
          </div>
          
          {/* Editors and Editor Affiliations Row */}
          {editors && editors.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Editors Column */}
              <div className="md:col-span-2">
                <h3 className="text-gray-500 text-xs uppercase tracking-wider mb-3 font-medium">Editors</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                  {editors.map((editor, idx) => (
                    <div key={idx} className="text-gray-300">
                      {editor.url ? (
                        <a href={editor.url} className="hover:text-accent-gold transition-colors" target="_blank" rel="noopener noreferrer">
                          {editor.name}
                        </a>
                      ) : (
                        editor.name
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Editor Affiliations Column */}
              {editorAffiliations && editorAffiliations.length > 0 && (
                <div>
                  <h3 className="text-gray-500 text-xs uppercase tracking-wider mb-3 font-medium">Affiliation</h3>
                  <div className="space-y-2">
                    {editorAffiliations.map((affil, idx) => (
                      <div key={idx} className="text-gray-300">{affil}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // Old layout for backward compatibility
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          {/* Authors (takes 2 columns) */}
          <div className="md:col-span-2">
            <h3 className="text-gray-500 text-xs uppercase tracking-wider mb-3 font-medium">Authors</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {authors.map((author, idx) => (
                <div key={idx} className="text-gray-300">
                  {author.url ? (
                    <a href={author.url} className="hover:text-accent-gold transition-colors" target="_blank" rel="noopener noreferrer">
                      {author.name}
                    </a>
                  ) : (
                    author.name
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Affiliation */}
          {affiliations && affiliations.length > 0 && (
            <div>
              <h3 className="text-gray-500 text-xs uppercase tracking-wider mb-3 font-medium">Affiliation</h3>
              <div className="space-y-2">
                {affiliations.map((affil, idx) => (
                  <div key={idx} className="text-gray-300">{affil}</div>
                ))}
              </div>
            </div>
          )}

          {/* Published */}
          <div>
            <h3 className="text-gray-500 text-xs uppercase tracking-wider mb-3 font-medium">Published</h3>
            <div className="text-gray-300">{publishedDate}</div>
          </div>
        </div>
      )}
    </div>
  );
}

