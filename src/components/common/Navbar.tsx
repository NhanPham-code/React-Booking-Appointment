// src/components/common/Navbar.tsx
'use client';

import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();

    const navItems = [
        { label: 'Home', path: '/' },
        { label: 'Book Appointment', path:  '/booking' },
        { label: 'Manage Time Slots', path:  '/timeslots' },
    ];

    return (
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Container maxWidth="lg">
                <Toolbar disableGutters>
                    <CalendarMonthIcon sx={{ color: 'primary. main', mr: 1 }} />
                    <Typography
                        variant="h6"
                        sx={{ flexGrow: 0, mr: 4, color: 'text.primary', fontWeight: 700, cursor: 'pointer' }}
                        onClick={() => router.push('/')}
                    >
                        BookingApp
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
                        {navItems. map((item) => (
                            <Button
                                key={item.path}
                                onClick={() => router.push(item.path)}
                                sx={{
                                    color: pathname === item.path ?  'primary.main' : 'text.secondary',
                                    fontWeight: pathname === item.path ?  600 : 400,
                                    '&:hover': { bgcolor: 'primary.light', color: 'white' },
                                }}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}