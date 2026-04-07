import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Topbar } from './components/layout/Topbar'
import { DashboardPage } from './pages/DashboardPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { CalculationsPage } from './pages/CalculationsPage'
import { SpecificationsListPage } from './pages/SpecificationsListPage'
import { SpecificationPage } from './pages/SpecificationPage'
import './styles/global.css'

function App() {
  return (
    <HashRouter>
      <div className="app">
        <Topbar />
        <div className="app-layout">
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/calculations" element={<CalculationsPage />} />
              <Route path="/specifications" element={<SpecificationsListPage />} />
              <Route path="/specification/:id" element={<SpecificationPage />} />
              <Route path="/specification" element={<SpecificationPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  )
}

export default App
