// src/components/common/Navbar.tsx
'use client';

import React from 'react';
import {
    AppBar, Toolbar, Typography, Button, Box, Container, IconButton,
    Drawer, List, ListItem, ListItemButton, ListItemText,
    Avatar, Menu, MenuItem, Tooltip, Divider, ListItemIcon
} from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import { useAuth } from '@/src/context/AuthContext';
import LoginIcon from '@mui/icons-material/Login';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = React.useState(false);

    // OBSERVER: This component listens to AuthContext to update UI
    const { user, isAuthenticated, logout } = useAuth();

    // State for User Dropdown Menu
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

    const navItems = [
        { label: 'Home', path: '/' },
        { label: 'Book Appointment', path: '/booking', roles: ['patient'] }, // Only patient
        { label: 'Manage Time Slots', path: '/timeslots', roles: ['doctor'] }, // Only doctor
    ];

    // Then in the render, filter by role:
    const visibleNavItems = navItems.filter(item => {
        if (!item.roles) return true; // No role restriction
        if (!user) return false; // Must be logged in
        return item.roles.includes(user.role);
    });

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleNavigate = (path: string) => {
        router.push(path);
        setMobileOpen(false);
    };

    // User Menu Handlers
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogout = () => {
        handleCloseUserMenu();
        logout();
    };

    // Mobile drawer content
    const drawer = (
        <Box sx={{ width: 250, pt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarMonthIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                        Booking Appointment App
                    </Typography>
                </Box>
                <IconButton onClick={handleDrawerToggle}>
                    <CloseIcon />
                </IconButton>
            </Box>
            <Divider />
            <List>
                {/* Navigation Links */}
                {visibleNavItems.map((item) => (
                    <ListItem key={item.path} disablePadding>
                        <ListItemButton
                            onClick={() => handleNavigate(item.path)}
                            selected={pathname === item.path}
                            sx={{
                                '&.Mui-selected': {
                                    bgcolor: 'primary.50',
                                    borderLeft: '4px solid',
                                    borderColor: 'primary.main'
                                }
                            }}
                        >
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}

                {/* AUTH BUTTONS (Login or Logout) */}
                <Divider sx={{ my: 1 }} />

                {isAuthenticated ? (
                    // User is Logged In -> Show LOGOUT
                    <ListItem disablePadding>
                        <ListItemButton onClick={handleLogout}>
                            <ListItemIcon>
                                <LogoutIcon color="error" />
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Typography color="error" fontWeight={500}>
                                        Logout
                                    </Typography>
                                }
                            />
                        </ListItemButton>
                    </ListItem>
                ) : (
                    // User is Guest -> Show LOGIN
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => handleNavigate('/login')}>
                            <ListItemIcon>
                                <LoginIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Typography color="primary.main" fontWeight={600}>
                                        Login
                                    </Typography>
                                }
                            />
                        </ListItemButton>
                    </ListItem>
                )}
            </List>
        </Box>
    );

    return (
        <>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    bgcolor: 'background.paper',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Container maxWidth="lg">
                    <Toolbar disableGutters sx={{ minHeight: { xs: 56, sm: 64 } }}>
                        {/* Logo */}
                        <CalendarMonthIcon sx={{ color: 'primary.main', mr: 1, display: { xs: 'none', sm: 'block' } }} />
                        <Typography
                            variant="h6"
                            sx={{
                                flexGrow: { xs: 1, md: 0 },
                                mr: { md: 4 },
                                color: 'text.primary',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: { xs: '1.1rem', sm: '1.25rem' }
                            }}
                            onClick={() => handleNavigate('/')}
                        >
                            Booking Appointment App
                        </Typography>

                        {/* Desktop Navigation Links (Filtered by Role) */}
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                            {visibleNavItems.map((item) => (
                                <Button
                                    key={item.path}
                                    onClick={() => handleNavigate(item.path)}
                                    sx={{
                                        color: pathname === item.path ? 'primary.main' : 'text.secondary',
                                        fontWeight: pathname === item.path ? 600 : 400,
                                        '&:hover': { bgcolor: 'primary.light', color: 'white' },
                                    }}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </Box>

                        {/* AUTH SECTION */}
                        <Box sx={{ flexGrow: 0 }}>
                            {isAuthenticated && user ? (
                                <>
                                    {/* Avatar (Clickable) */}
                                    <Tooltip title="Open settings">
                                        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                            <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                                {user.fullName?.charAt(0).toUpperCase()}
                                            </Avatar>
                                        </IconButton>
                                    </Tooltip>

                                    {/* Dropdown Menu */}
                                    <Menu
                                        sx={{ mt: '45px' }} 
                                        id="menu-appbar"
                                        anchorEl={anchorElUser}
                                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                        keepMounted
                                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                        open={Boolean(anchorElUser)}
                                        onClose={handleCloseUserMenu}
                                    >
                                        <Box sx={{ px: 2, py: 1 }}>
                                            <Typography variant="subtitle2" fontWeight={700}>
                                                {user.fullName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {user.role.toUpperCase()}
                                            </Typography>
                                        </Box>
                                        <Divider />
                                        {/* <MenuItem onClick={() => {router.push('/profile')}}>
                                            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                                            Profile
                                        </MenuItem> */}
                                        <MenuItem onClick={() => {router.push('/booking-history')}}>
                                            <ListItemIcon><HistoryIcon fontSize="small" /></ListItemIcon>
                                            Booking History
                                        </MenuItem>
                                        <Divider />
                                        <MenuItem onClick={handleLogout}>
                                            <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                                            <Typography color="error">Logout</Typography>
                                        </MenuItem>
                                    </Menu>
                                </>
                            ) : (
                                /* Show Login Button if NOT authenticated */
                                <Button
                                    variant="outlined"
                                    onClick={() => router.push('/login')}
                                    sx={{ display: { xs: 'none', md: 'block' } }}
                                >
                                    Login
                                </Button>
                            )}
                        </Box>

                        {/* Mobile Menu Button */}
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="end"
                            onClick={handleDrawerToggle}
                            sx={{ display: { md: 'none' }, ml: 1, color: 'text.primary' }}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
                }}
            >
                {drawer}
            </Drawer>
        </>
    );
}