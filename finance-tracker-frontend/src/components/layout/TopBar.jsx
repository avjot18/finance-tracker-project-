import React from 'react'
import {
  AppBar, Toolbar, IconButton, Typography, Box, Avatar, Tooltip, Button,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const TopBar = ({ drawerWidth, onMenuClick }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        bgcolor: 'rgba(15,23,42,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(99,102,241,0.15)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box>
            <Typography
              variant="body2"
              sx={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1 }}
            >
              {getGreeting()},
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: '#f1f5f9', fontSize: '1rem', lineHeight: 1.3 }}
            >
              {user?.fullName || 'User'} 👋
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title="Logout">
            <Button
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              size="small"
              sx={{
                color: '#94a3b8', textTransform: 'none', fontSize: '0.85rem',
                '&:hover': { color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' },
              }}
            >
              Logout
            </Button>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default TopBar
