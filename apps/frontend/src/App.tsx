import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarProvider, useSidebar } from './contexts/SidebarContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Footer } from './components/common/Footer';
import { OverviewPage } from './pages/OverviewPage';
import { DatasetsPage } from './pages/DatasetsPage';
import { DatasetDetailPage } from './pages/DatasetDetailPage';
import { ModelsPage } from './pages/ModelsPage';
import { ModelDetailPage } from './pages/ModelDetailPage';
import { DocumentationPage } from './pages/DocumentationPage';
import { DocumentationBaselinesPage } from './pages/DocumentationBaselinesPage';
import { DocumentationAuxMemoryPage } from './pages/DocumentationAuxMemoryPage';
import { DocumentationSparseAttentionPage } from './pages/DocumentationSparseAttentionPage';
import { BaselineDetailPage } from './pages/BaselineDetailPage';
import { ContributePage } from './pages/ContributePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Mobile Header - hidden on desktop */}
      <div className="block md:hidden">
        <Header />
      </div>
      
      {/* Main Content */}
      <main 
        className={`min-h-screen transition-all duration-300 
          pt-20 px-4 pb-8
          md:pt-8 md:px-0 md:pb-8
          ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} md:pl-8 md:pr-8
        `}
      >
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/website" element={<OverviewPage />} />
            <Route path="/datasets" element={<DatasetsPage />} />
            <Route path="/datasets/:datasetId" element={<DatasetDetailPage />} />
            <Route path="/models" element={<ModelsPage />} />
            <Route path="/models/:modelId" element={<ModelDetailPage />} />
            <Route path="/documentation" element={<DocumentationPage />} />
            <Route path="/documentation/baselines" element={<DocumentationBaselinesPage />} />
            <Route path="/documentation/baselines/:baselineId" element={<BaselineDetailPage />} />
            <Route path="/documentation/auxiliary-memory" element={<DocumentationAuxMemoryPage />} />
            <Route path="/documentation/sparse-attention" element={<DocumentationSparseAttentionPage />} />
            <Route path="/contribute" element={<ContributePage />} />
          </Routes>
          <Footer />
        </div>
      </main>
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SidebarProvider>
          <AppContent />
        </SidebarProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

