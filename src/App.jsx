import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DynamicBackground from './components/DynamicBackground';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Links from './pages/Links';
import Projects from './pages/Projects';
import Blog from './pages/Blog';
import Prompts from './pages/Prompts';
import Videos from './pages/Videos';
import Analytics from './pages/Analytics';
import WorkspaceManager from './pages/WorkspaceManager';
import ChatbotContainer from './components/Chatbot/ChatbotContainer';
import { themeStorage } from './utils/storage';
import './styles/index.css';
import './styles/theme.css';
import './styles/components.css';
import './styles/animations.css';

function App() {
  useEffect(() => {
    // Initialize theme on app load
    const savedTheme = themeStorage.get();
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <WorkspaceProvider>
      <Router>
        <div className="app" style={{ minHeight: '100vh', background: 'transparent' }}>
          <DynamicBackground />
          <Routes>
            {/* Public / Marketing Route */}
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/reset-password" element={<Navigate to="/" replace />} />

            {/* Direct Workspace Routes (No Login Required) */}
            <Route path="/*" element={
              <>
                <Sidebar />
                <Navbar />
                <main className="main-content" style={{
                  marginLeft: 'var(--sidebar-width-collapsed)',
                  minHeight: 'calc(100vh - 70px)',
                  transition: 'margin 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/links" element={<Links />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/prompts" element={<Prompts />} />
                    <Route path="/videos" element={<Videos />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/workspaces" element={<WorkspaceManager />} />
                  </Routes>
                  <style>{`
                    @media (max-width: 768px) {
                      .main-content {
                        margin-left: 0 !important;
                        padding: 0 !important;
                      }
                    }
                  `}</style>
                </main>
              </>
            } />
          </Routes>
          <ChatbotContainer />
        </div>
      </Router>
    </WorkspaceProvider>
  );
}

export default App;
