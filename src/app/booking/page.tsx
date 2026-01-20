// src/app/booking/page.tsx
'use client';

import { Container, Grid, Box, Typography } from '@mui/material';
import Navbar from '@/src/components/common/Navbar';
import PageHeader from '@/src/components/common/PageHeader';
import BookingForm from '@/src/components/booking/BookingForm';
import BookingList from '@/src/components/booking/BookingList';

export default function BookingPage() {

    return (
        <>
            <Navbar />
            <Box sx={{ 
                minHeight: '100vh', 
                bgcolor: 'background.default', 
                py: { xs: 3, sm: 4 },
                px: { xs: 2, sm: 3 }
            }}>
                <Container maxWidth="xl">
                    <PageHeader
                        title="Book an Appointment"
                        subtitle="Select a date, choose your preferred time slots, and fill in your details"
                    />

                    <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
                        {/* Form - Full width on mobile, larger on desktop */}
                        <Grid 
                            size={{ xs: 12, md: 7 }}
                            sx={{ order: { xs: 1, md: 1 } }}
                        >
                            <BookingForm />
                        </Grid>

                        {/* Booking list - Below form on mobile, right side on desktop */}
                        <Grid 
                            size={{ xs: 12, md: 5 }}
                            sx={{ order: { xs: 2, md: 2 } }}
                        >
                            <Typography 
                                variant="h6" 
                                gutterBottom
                                sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                            >
                                Recent Bookings
                            </Typography>
                            <BookingList />
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </>
    );
}