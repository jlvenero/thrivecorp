import React from 'react';
import { NavLink } from 'react-router-dom';
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Button, Divider } from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import LockResetIcon from '@mui/icons-material/LockReset';
import BusinessIcon from '@mui/icons-material/Business';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import ApartmentIcon from '@mui/icons-material/Apartment';

const activeLinkStyle = {
  backgroundColor: '#22c55e',
  color: 'white',
  '& .MuiListItemIcon-root, & .MuiTypography-root': {
    color: 'white',
  },
};

const Sidebar = ({ onLogout }) => {
  const userRole = localStorage.getItem('userRole');

  const navItems = [
    { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, roles: ['thrive_admin', 'company_admin', 'provider', 'collaborator'] },
    { text: 'Alterar Senha', path: '/change-password', icon: <LockResetIcon />, roles: ['thrive_admin', 'company_admin', 'provider', 'collaborator'] },
    { text: 'Aprovar Empresas', path: '/admin/empresas', icon: <BusinessIcon />, roles: ['thrive_admin'] },
    { text: 'Aprovar Academias', path: '/admin/academias', icon: <FitnessCenterIcon />, roles: ['thrive_admin'] },
    { text: 'Extrato de Faturamento', path: '/admin/billing', icon: <ReceiptLongIcon />, roles: ['thrive_admin'] },
    { text: 'Gerenciar Admins', path: '/admin/manage-admins', icon: <AdminPanelSettingsIcon />, roles: ['thrive_admin'] },
    { text: 'Gerenciar Colaboradores', path: '/empresa/colaboradores', icon: <PeopleIcon />, roles: ['company_admin'] },
    { text: 'Minhas Academias', path: '/prestador/academias', icon: <FitnessCenterIcon />, roles: ['provider'] },
  ];

  return (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        bgcolor: 'secondary.main',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4, pl: 1 }}>
            <ApartmentIcon sx={{ color: 'logo.main' }} />
            <Typography variant="h6" sx={{ color: 'logo.main' }}>
                Menu ThriveCorp
            </Typography>
        </Box>

        <List>
          {navItems.filter(item => item.roles.includes(userRole)).map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                sx={{
                  borderRadius: '8px',
                  '&.active': activeLinkStyle,
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                }}
              >
                <ListItemIcon sx={{ color: '#94a3b8' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ p: 2 }}>
        <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.12)' }} />
        <Button
            variant="text"
            onClick={onLogout}
            startIcon={<LogoutIcon />}
            sx={{
              color: '#94a3b8',
              width: '100%',
              justifyContent: 'flex-start',
              p: 1.5,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: 'white'
              }
            }}
          >
            Sair
        </Button>
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: '#64748b' }}>
          ThriveCorp Admin v1.0
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;