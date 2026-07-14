import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CssBaseline from '@mui/material/CssBaseline'
import './index.css'
import Layout from './Layout.tsx'
import RequireAuth from './RequireAuth.tsx'
import App from './App.tsx'
import LoginPage from './pages/login/LoginPage.tsx'
import UsersPage from './pages/users/UsersPage.tsx'
import TenantsPage from './pages/tenants/TenantsPage.tsx'
import SecurityGroupsPage from './pages/securityGroups/SecurityGroupsPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CssBaseline />
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<Layout />}>
          <Route path="/" element={<App />} />
          <Route
            path="/users"
            element={
              <RequireAuth>
                <UsersPage />
              </RequireAuth>
            }
          />
          <Route
            path="/tenants"
            element={
              <RequireAuth>
                <TenantsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/security-groups"
            element={
              <RequireAuth>
                <SecurityGroupsPage />
              </RequireAuth>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
