import React, { useEffect, useState } from 'react';

interface TableOfContentsProps {
  contentRef: React.RefObject<HTMLDivElement>;
  slug?: string;
}

export function TableOfContents({ contentRef, slug }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (!contentRef.current) return;

    // Find all h2 and h3 elements
    const elements = contentRef.current.querySelectorAll('h2, h3');
    const newHeadings: { id: string; text: string; level: number }[] = [];

    elements.forEach((elem, index) => {
      // Ensure element has an ID
      if (!elem.id) {
        elem.id = `heading-${index}`;
      }
      newHeadings.push({
        id: elem.id,
        text: elem.textContent || '',
        level: parseInt(elem.tagName[1]),
      });
    });

    setHeadings(newHeadings);

    // Setup Intersection Observer for active state
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { 
        // Relaxed margins to handle header overlap
        // Top: -80px (just below sticky header)
        // Bottom: -60% (highlight when in top 40% of screen)
        rootMargin: '-80px 0px -60%' 
      }
    );

    elements.forEach((elem) => observer.observe(elem));

    return () => observer.disconnect();
  }, [contentRef, slug]); // Re-run when contentRef or slug changes

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-24 self-start w-64 hidden lg:block pr-8">
      <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Contents</h4>
      <ul className="space-y-3 text-sm border-l border-gray-800">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                // Manually set active immediately for better UX
                setActiveId(heading.id);
              }}
              className={`block pl-4 border-l-2 -ml-[1px] transition-colors duration-200 ${
                activeId === heading.id
                  ? 'border-accent-gold text-accent-gold'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'
              } ${heading.level === 3 ? 'pl-8' : ''}`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
