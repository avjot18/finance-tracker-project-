import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

const DRAWER_WIDTH = 260

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        onClose={handleDrawerToggle}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <TopBar drawerWidth={DRAWER_WIDTH} onMenuClick={handleDrawerToggle} />
        <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, mt: '64px' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default AppLayout
