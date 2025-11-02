import { Link, useLocation } from 'react-router-dom';
import { useDatasets } from '../../hooks/useDatasets';
import { useBaselines } from '../../hooks/useBaselines';

export function Breadcrumb() {
  const location = useLocation();
  const { data: datasets } = useDatasets();
  const { data: baselines } = useBaselines();
  
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  if (pathSegments.length === 0) {
    return null;
  }

  const breadcrumbs: { label: string; path: string }[] = [
    { label: 'Overview', path: '/website' }
  ];

  // Build breadcrumbs based on path
  if (pathSegments[0] === 'datasets') {
    breadcrumbs.push({ label: 'Datasets', path: '/datasets' });
  } else if (pathSegments[0] === 'comparison') {
    breadcrumbs.push({ label: 'Comparison', path: '/comparison' });
  } else if (pathSegments[0] === 'contribute') {
    breadcrumbs.push({ label: 'Contribute', path: '/contribute' });
  } else if (pathSegments[0] === 'documentation') {
    breadcrumbs.push({ label: 'Documentation', path: '/documentation' });
    
    if (pathSegments[1] === 'baselines') {
      breadcrumbs.push({ label: 'Baselines', path: '/documentation/baselines' });
      // If viewing a specific baseline
      if (pathSegments.length === 3 && baselines) {
        const baseline = baselines.find(b => b.id === pathSegments[2]);
        if (baseline) {
          breadcrumbs.push({ label: baseline.name, path: location.pathname });
        }
      }
    } else if (pathSegments[1] === 'datasets') {
      breadcrumbs.push({ label: 'Datasets', path: '/documentation/datasets' });
      // If viewing a specific dataset
      if (pathSegments.length === 3 && datasets) {
        const dataset = datasets.find(d => d.id === pathSegments[2]);
        if (dataset) {
          breadcrumbs.push({ label: dataset.name, path: location.pathname });
        }
      }
    }
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
      {breadcrumbs.map((crumb, index) => (
        <div key={`${crumb.path}-${index}`} className="flex items-center gap-2">
          {index > 0 && <span>/</span>}
          {index === breadcrumbs.length - 1 || !crumb.path ? (
            <span className="text-white">{crumb.label}</span>
          ) : (
            <Link 
              to={crumb.path} 
              className="hover:text-white transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

