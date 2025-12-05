export interface Author {
  name: string;
  url?: string;
  affiliationIndices?: number[];
}

export interface BlogHeaderInfo {
  authors: Author[];
  editors?: Author[];
  affiliations: string[];
  publishedDate: string;
}

export function BlogAuthorHeader({ authors, editors, affiliations, publishedDate }: BlogHeaderInfo) {
  return (
    <div className="border-t border-b border-gray-800 py-8 my-12">
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
                {author.affiliationIndices && (
                  <sup className="ml-0.5 text-gray-400">{author.affiliationIndices.join(',')}</sup>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Affiliation */}
        <div>
          <h3 className="text-gray-500 text-xs uppercase tracking-wider mb-3 font-medium">Affiliation</h3>
          <div className="space-y-2">
            {affiliations.map((affil, idx) => (
              <div key={idx} className="text-gray-300">
                {affiliations.length > 1 && <sup className="mr-1 text-gray-400">{idx + 1}</sup>}
                {affil}
              </div>
            ))}
          </div>
        </div>

        {/* Published */}
        <div>
          <h3 className="text-gray-500 text-xs uppercase tracking-wider mb-3 font-medium">Published</h3>
          <div className="text-gray-300">{publishedDate}</div>
        </div>
      </div>

      {/* Editors (Single line below) */}
      {editors && editors.length > 0 && (
        <div className="mt-8 pt-4 border-t border-gray-800/50">
          <div className="text-sm flex flex-wrap items-baseline gap-x-4">
            <h3 className="text-gray-500 text-xs uppercase tracking-wider font-medium">Editors</h3>
            <div className="text-gray-300">
              {editors.map((editor, idx) => (
                <span key={idx}>
                  {idx > 0 && ", "}
                  {editor.url ? (
                    <a href={editor.url} className="hover:text-accent-gold transition-colors" target="_blank" rel="noopener noreferrer">
                      {editor.name}
                    </a>
                  ) : (
                    editor.name
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

