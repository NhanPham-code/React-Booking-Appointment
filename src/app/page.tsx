// src/app/page.tsx
'use client';

import { Container, Grid, Box } from '@mui/material';
import Navbar from '@/src/components/common/Navbar';
import PageHeader from '@/src/components/common/PageHeader';
import FeatureCard from '@/src/components/card/FeatureCard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { useAuth } from '../context/AuthContext';

const features = [
    {
        title: 'Book Appointment',
        description: 'Browse available time slots and book your appointment quickly and easily. Get instant confirmation.',
        icon: <CalendarMonthIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main' }} />,
        buttonText: 'Book Now',
        href: '/doctors',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
        title: 'Manage Time Slots',
        description: 'Create and manage available time slots for appointments. Set your schedule with flexibility.',
        icon: <AccessTimeIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'secondary.main' }} />,
        buttonText: 'Manage Slots',
        href: '/timeslots',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
        title: 'Booking History',
        description: 'See all your upcoming appointments in one place. Easy to track and manage your schedule.',
        icon: <EventNoteIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'success.main' }} />,
        buttonText: 'View Bookings',
        href: '/booking-history',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
];


export default function Home() {

    const { user, isAuthenticated } = useAuth();

    let visibleFeatures = null;

    if (isAuthenticated && user) {
        visibleFeatures = features.filter(feature => {
            if (feature.title === 'Book Appointment' && user.role !== 'patient') {
                return false;
            }
            if (feature.title === 'Manage Time Slots' && user.role !== 'doctor') {
                return false;
            }
            return true;
        });
    } else {
        visibleFeatures = features;
    }

    return (
        <>
            <Navbar />
            <Box sx={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
                pt: { xs: 4, sm: 6, md: 8 },
                pb: { xs: 8, sm: 10, md: 12 },
                px: { xs: 2, sm: 3 }
            }}>
                <Container maxWidth="lg">
                    <PageHeader
                        title="Appointment Booking App"
                    />

                    <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mt: { xs: 2, sm: 3, md: 4 } }}>
                        {visibleFeatures && visibleFeatures.map((feature, index) => (
                            <Grid
                                key={index}
                                size={{ xs: 12, sm: 6, md: 4 }}
                            >
                                <FeatureCard {...feature} />
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>
        </>
    );
}