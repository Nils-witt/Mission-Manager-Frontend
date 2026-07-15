import { Outlet, useNavigate } from 'react-router-dom'

import Box from '@mui/material/Box'
import { clearSession } from './api/authStore'
import ApplicationAppBar from './components/ApplicationAppBar'

function Layout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearSession()
    navigate('/')
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ApplicationAppBar
        pages={[
          { name: 'Home', link: '/' },
          { name: 'Users', link: '/users' },
          { name: 'Tenants', link: '/tenants' },
          { name: 'Missions', link: '/missions' },
          { name: 'Qualifications', link: '/qualifications' },
        ]}
        profileActions={[{ name: 'Logout', action: handleLogout }]}
      />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
    </Box>
  )
}

export default Layout
