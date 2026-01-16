// src/app/booking/page. tsx
'use client';

import { Container, Grid, CircularProgress, Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/src/components/common/Navbar';
import PageHeader from '@/src/components/common/PageHeader';
import BookingForm from '@/src/components/booking/BookingForm';
import BookingList from '@/src/components/booking/BookingList';
import { bookingService } from '@/src/services/bookingServices';
import { QUERY_KEYS } from '@/src/constants/queryKey';

export default function BookingPage() {
    const { data:  bookings = [], isLoading } = useQuery({
        queryKey: QUERY_KEYS.BOOKINGS.ALL,
        queryFn: bookingService.getAll,
    });

    return (
        <>
            <Navbar />
            <Box sx={{ minHeight: '100vh', bgcolor: 'background. default', py: 4 }}>
                <Container maxWidth="lg">
                    <PageHeader
                        title="Book an Appointment"
                        subtitle="Select a date, choose your preferred time slots, and fill in your details"
                    />

                    <Grid container spacing={4}>
                        {/* Form chiếm nhiều không gian hơn */}
                        <Grid size={{ xs: 12, md: 7 }}>
                            <BookingForm />
                        </Grid>

                        {/* Booking list bên phải */}
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Typography variant="h6" gutterBottom>
                                Recent Bookings
                            </Typography>
                            {isLoading ? (
                                <Box display="flex" justifyContent="center" py={4}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <BookingList bookings={bookings} />
                            )}
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </>
    );
}