import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Topbar } from './components/layout/Topbar'
import { DashboardPage } from './pages/DashboardPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { CalculationsPage } from './pages/CalculationsPage'
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
              <Route path="/specifications" element={<div>Спецификации (заглушка)</div>} />
              <Route path="/specification/:id" element={<div>Спецификация (заглушка)</div>} />
              <Route path="/specification" element={<div>Новая спецификация (заглушка)</div>} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  )
}

export default App
