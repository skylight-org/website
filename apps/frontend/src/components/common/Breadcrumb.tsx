import { Link, useLocation } from 'react-router-dom';
import { useDatasets } from '../../hooks/useDatasets';
import { useBaselines } from '../../hooks/useBaselines';
import { useLLMs } from '../../hooks/useLLMs';

export function Breadcrumb() {
  const location = useLocation();
  const { data: datasets } = useDatasets();
  const { data: baselines } = useBaselines();
  const { data: llms } = useLLMs();
  
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  if (pathSegments.length === 0) {
    return null;
  }

  const breadcrumbs: { label: string; path: string }[] = [
    { label: 'Home', path: '/models' }
  ];

  // Build breadcrumbs based on path
  if (pathSegments[0] === 'datasets') {
    breadcrumbs.push({ label: 'Datasets', path: '/datasets' });
    // If viewing a specific dataset
    if (pathSegments.length === 2 && datasets) {
      const dataset = datasets.find(d => d.id === pathSegments[1]);
      if (dataset) {
        breadcrumbs.push({ label: dataset.name, path: location.pathname });
      }
    }
  } else if (pathSegments[0] === 'models') {
    breadcrumbs.push({ label: 'Overview', path: '/models' });
    // If viewing a specific model
    if (pathSegments.length === 2 && llms) {
      const model = llms.find(l => l.id === pathSegments[1]);
      if (model) {
        breadcrumbs.push({ label: model.name, path: location.pathname });
      }
    }
  } else if (pathSegments[0] === 'arena') {
    breadcrumbs.push({ label: 'Arena', path: '/arena' });
  } else if (pathSegments[0] === 'about') {
    breadcrumbs.push({ label: 'About', path: '/about' });
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

