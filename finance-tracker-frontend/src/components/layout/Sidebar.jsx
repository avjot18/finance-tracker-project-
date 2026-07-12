import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Divider, Avatar,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import AssessmentIcon from '@mui/icons-material/Assessment'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Transactions', path: '/transactions', icon: <ReceiptLongIcon /> },
  { label: 'Budgets', path: '/budgets', icon: <AccountBalanceWalletIcon /> },
  { label: 'Reports', path: '/reports', icon: <AssessmentIcon /> },
]

const SidebarContent = ({ drawerWidth }) => {
  const location = useLocation()
  const { user } = useAuth()

  return (
    <Box
      sx={{
        width: drawerWidth,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#0f172a',
        borderRight: '1px solid rgba(99,102,241,0.15)',
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40, height: 40, borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <AccountBalanceWalletIcon sx={{ color: '#fff', fontSize: 22 }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ lineHeight: 1.1, fontWeight: 800, color: '#f1f5f9' }}>
            FinTrack
          </Typography>
          <Typography variant="caption" sx={{ color: '#6366f1' }}>
            Finance Tracker
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(99,102,241,0.15)', mx: 2 }} />

      {/* Nav Links */}
      <List sx={{ px: 2, py: 2, flexGrow: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                sx={{
                  borderRadius: '12px',
                  py: 1.2,
                  transition: 'all 0.2s ease',
                  bgcolor: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                  '&:hover': {
                    bgcolor: 'rgba(99,102,241,0.1)',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 38,
                    color: isActive ? '#6366f1' : '#64748b',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#f1f5f9' : '#94a3b8',
                  }}
                />
                {isActive && (
                  <Box
                    sx={{
                      width: 4, height: 20, borderRadius: 2,
                      bgcolor: '#6366f1', ml: 1,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>


    </Box>
  )
}

const Sidebar = ({ drawerWidth, mobileOpen, onClose }) => (
  <>
    {/* Mobile Drawer */}
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', bgcolor: '#0f172a' },
      }}
    >
      <SidebarContent drawerWidth={drawerWidth} />
    </Drawer>

    {/* Desktop Permanent Drawer */}
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': {
          width: drawerWidth, boxSizing: 'border-box', bgcolor: '#0f172a',
          border: 'none',
        },
      }}
      open
    >
      <SidebarContent drawerWidth={drawerWidth} />
    </Drawer>
  </>
)

export default Sidebar
