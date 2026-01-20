// src/components/common/Navbar.tsx
'use client';

import {
    AppBar, Toolbar, Typography, Button, Box, Container, IconButton,
    Drawer, List, ListItem, ListItemButton, ListItemText
} from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const navItems = [
        { label: 'Home', path: '/' },
        { label: 'Book Appointment', path: '/booking' },
        { label: 'Manage Time Slots', path: '/timeslots' },
    ];

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleNavigate = (path: string) => {
        router.push(path);
        setMobileOpen(false);
    };

    // Mobile drawer
    const drawer = (
        <Box sx={{ width: 250, pt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarMonthIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                        BookingApp
                    </Typography>
                </Box>
                <IconButton onClick={handleDrawerToggle}>
                    <CloseIcon />
                </IconButton>
            </Box>
            <List>
                {navItems.map((item) => (
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
                            <ListItemText
                                primary={item.label}
                                slotProps={{
                                    primary: {
                                        sx: {
                                            fontWeight: pathname === item.path ? 600 : 400,
                                            color: pathname === item.path ? 'primary.main' : 'text.primary',
                                        }
                                    }
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
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
                            BookingApp
                        </Typography>

                        {/* Desktop Navigation */}
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                            {navItems.map((item) => (
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

                        {/* Mobile Menu Button */}
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="end"
                            onClick={handleDrawerToggle}
                            sx={{ display: { md: 'none' }, color: 'text.primary' }}
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
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile
                }}
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