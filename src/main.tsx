import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { ColorModeProvider } from './theme/ColorModeProvider.tsx'
import Layout from './Layout.tsx'
import RequireAuth from './RequireAuth.tsx'
import App from './App.tsx'
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ColorModeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Layout />}>
            <Route
              path="/"
              element={
                <RequireAuth>
                  <App />
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
  </StrictMode>,
)
