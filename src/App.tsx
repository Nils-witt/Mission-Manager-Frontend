import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { ApplicationLogger } from './ApplicationLogger'
import { useEffect } from 'react'
import { ColorModeProvider } from './theme/ColorModeProvider'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/login/LoginPage.tsx'
import UsersPage from './pages/users/UsersPage.tsx'
import UserFormPage from './pages/users/UserFormPage.tsx'
import TenantsPage from './pages/tenants/TenantsPage.tsx'
import TenantFormPage from './pages/tenants/TenantFormPage.tsx'
import SecurityGroupsPage from './pages/securityGroups/SecurityGroupsPage.tsx'
import SecurityGroupFormPage from './pages/securityGroups/SecurityGroupFormPage.tsx'
import MissionsPage from './pages/missions/MissionsPage.tsx'
import MissionFormPage from './pages/missions/MissionFormPage.tsx'
import MissionUsersPage from './pages/missions/MissionUsersPage.tsx'
import MissionPositionsPage from './pages/missions/MissionPositionsPage.tsx'
import { MissionDetailPage } from './pages/missions/MissionDetailPage.tsx'
import QualificationsPage from './pages/qualifications/QualificationsPage.tsx'
import QualificationFormPage from './pages/qualifications/QualificationFormPage.tsx'
import QualificationTypesPage from './pages/qualifications/QualificationTypesPage.tsx'
import QualificationTypeFormPage from './pages/qualifications/QualificationTypeFormPage.tsx'
import Layout from './Layout.tsx'
import RequireAuth from './RequireAuth.tsx'

function App() {
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/config.json')
        const config = (await res.json()) as { apiUrl?: string }
        if (config.apiUrl) {
          if (localStorage.getItem('apiUrl') != config.apiUrl) {
            localStorage.setItem('apiUrl', config.apiUrl)
            window.location.reload()
          }
        }
      } catch {
        ApplicationLogger.info('No config.json found, using defaults', {
          service: 'App',
        })
      }
    })()
  }, [])
  return (
    <ColorModeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Layout />}>
            <Route
              path="/"
              element={
                <RequireAuth>
                  <HomePage />
                </RequireAuth>
              }
            />
            <Route
              path="/users"
              element={
                <RequireAuth>
                  <UsersPage />
                </RequireAuth>
              }
            />
            <Route
              path="/users/new"
              element={
                <RequireAuth>
                  <UserFormPage />
                </RequireAuth>
              }
            />
            <Route
              path="/users/:id/edit"
              element={
                <RequireAuth>
                  <UserFormPage />
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
              path="/tenants/new"
              element={
                <RequireAuth>
                  <TenantFormPage />
                </RequireAuth>
              }
            />
            <Route
              path="/tenants/:id/edit"
              element={
                <RequireAuth>
                  <TenantFormPage />
                </RequireAuth>
              }
            />
            <Route
              path="/tenants/:tenantId/security-groups"
              element={
                <RequireAuth>
                  <SecurityGroupsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/tenants/:tenantId/security-groups/new"
              element={
                <RequireAuth>
                  <SecurityGroupFormPage />
                </RequireAuth>
              }
            />
            <Route
              path="/tenants/:tenantId/security-groups/:id/edit"
              element={
                <RequireAuth>
                  <SecurityGroupFormPage />
                </RequireAuth>
              }
            />
            <Route
              path="/missions"
              element={
                <RequireAuth>
                  <MissionsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/missions/new"
              element={
                <RequireAuth>
                  <MissionFormPage />
                </RequireAuth>
              }
            />
            <Route
              path="/missions/:id"
              element={
                <RequireAuth>
                  <MissionDetailPage />
                </RequireAuth>
              }
            />
            <Route
              path="/missions/:id/edit"
              element={
                <RequireAuth>
                  <MissionFormPage />
                </RequireAuth>
              }
            />
            <Route
              path="/missions/:id/users"
              element={
                <RequireAuth>
                  <MissionUsersPage />
                </RequireAuth>
              }
            />
            <Route
              path="/missions/:id/positions"
              element={
                <RequireAuth>
                  <MissionPositionsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/qualifications"
              element={
                <RequireAuth>
                  <QualificationsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/qualifications/new"
              element={
                <RequireAuth>
                  <QualificationFormPage />
                </RequireAuth>
              }
            />
            <Route
              path="/qualifications/:id/edit"
              element={
                <RequireAuth>
                  <QualificationFormPage />
                </RequireAuth>
              }
            />
            <Route
              path="/qualification-types"
              element={
                <RequireAuth>
                  <QualificationTypesPage />
                </RequireAuth>
              }
            />
            <Route
              path="/qualification-types/new"
              element={
                <RequireAuth>
                  <QualificationTypeFormPage />
                </RequireAuth>
              }
            />
            <Route
              path="/qualification-types/:id/edit"
              element={
                <RequireAuth>
                  <QualificationTypeFormPage />
                </RequireAuth>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ColorModeProvider>
  )
}

function HomePage() {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to Mission Manager
      </Typography>
      <Typography color="text.secondary"></Typography>
    </Container>
  )
}

export default App
