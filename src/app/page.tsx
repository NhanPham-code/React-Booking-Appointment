// src/app/page.tsx
'use client';

import { Container, Grid, Box, Typography } from '@mui/material';
import Navbar from '@/src/components/common/Navbar';
import PageHeader from '@/src/components/common/PageHeader';
import FeatureCard from '@/src/components/home/FeatureCard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventNoteIcon from '@mui/icons-material/EventNote';

export default function Home() {
    const features = [
        {
            title: 'Book Appointment',
            description: 'Browse available time slots and book your appointment quickly and easily. Get instant confirmation.',
            icon: <CalendarMonthIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main' }} />,
            buttonText: 'Book Now',
            href: '/booking',
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
            title: 'View All Bookings',
            description: 'See all your upcoming appointments in one place. Easy to track and manage your schedule.',
            icon: <EventNoteIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'success.main' }} />,
            buttonText: 'View Bookings',
            href: '/booking',
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        },
    ];

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
                        title="Appointment Booking System"
                        subtitle="Simplify your scheduling with our modern booking platform"
                    />

                    <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mt: { xs: 2, sm: 3, md: 4 } }}>
                        {features.map((feature, index) => (
                            <Grid 
                                key={index}
                                size={{ xs: 12, sm: 6, md: 4 }}
                            >
                                <FeatureCard {...feature} />
                            </Grid>
                        ))}
                    </Grid>

                    <Box sx={{ mt: { xs: 6, sm: 8 }, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            Built with Next.js, Material-UI, and React Query
                        </Typography>
                    </Box>
                </Container>
            </Box>
        </>
    );
}