// src/app/booking-history/page.tsx
'use client';

import React, { useState } from 'react';
import {
    Container, Box, Paper, Typography, CircularProgress, Stack, Chip, Tabs, Tab, Alert, 
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import TodayIcon from '@mui/icons-material/Today';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PersonIcon from '@mui/icons-material/Person';
import Navbar from '@/src/components/common/Navbar';
import PageHeader from '@/src/components/common/PageHeader';
import { withProtectedRoute } from '@/src/hoc/withProtectedRoute';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/src/services/bookingServices';
import { useAuth } from '@/src/context/AuthContext';
import { QUERY_KEYS } from '@/src/constants/queryKey';
import { BookingWithStatus, enrichBookingWithStatus, sortBookingsByStatus } from '@/src/utils/bookingUtils';
import ConfirmDeleteDialog from '@/src/components/common/ConfirmDeleteDialog';
import BookingCard from '@/src/components/booking/BookingCard';
import RescheduleDialog from '@/src/components/booking/RescheduleDialog';

// Tab filter type
type TabFilter = 'all' | 'today' | 'upcoming' | 'past';

function BookingHistoryPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [tabValue, setTabValue] = useState<TabFilter>('all');
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [rescheduleBooking, setRescheduleBooking] = useState<BookingWithStatus | null>(null);

    // Fetch bookings based on user role
    const { data: bookings = [], isLoading, error } = useQuery({
        queryKey: user?.role === 'doctor'
            ? QUERY_KEYS.BOOKINGS.ALL
            : QUERY_KEYS.BOOKINGS.BY_USER(user?.id || ''),
        queryFn: async () => {
            if (!user) return [];

            // Doctor sees ALL bookings
            if (user.role === 'doctor') {
                return bookingService.getAll();
            }

            // Patient sees ONLY their bookings
            return bookingService.getByUserId(user.id);
        },
        enabled: !!user,
    });

    // Enrich and sort bookings (with status by using bookingUtils & save in memo to avoid re-computation)
    const enrichedBookings = React.useMemo(() => {
        if (!bookings.length) return [];
        const withStatus = bookings.map(enrichBookingWithStatus);
        return sortBookingsByStatus(withStatus);
    }, [bookings]);

    // Filter by tab value and enriched bookings save in memo to avoid re-computation
    const filteredBookings = React.useMemo(() => {
        if (tabValue === 'all') return enrichedBookings;
        return enrichedBookings.filter(b => b.status === tabValue);
    }, [enrichedBookings, tabValue]);

    // Count by status
    const statusCounts = React.useMemo(() => ({
        all: enrichedBookings.length,
        today: enrichedBookings.filter(b => b.status === 'today').length,
        upcoming: enrichedBookings.filter(b => b.status === 'upcoming').length,
        past: enrichedBookings.filter(b => b.status === 'past').length,
    }), [enrichedBookings]);

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: bookingService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS.ALL });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_SLOTS.ALL });
            setDeleteId(null);
        }
    });

    // Loading state
    if (isLoading) {
        return (
            <>
                <Navbar />
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                    <CircularProgress />
                </Box>
            </>
        );
    }

    // Error state
    if (error) {
        return (
            <>
                <Navbar />
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    <Alert severity="error">Failed to load bookings. Please try again.</Alert>
                </Container>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
                <Container maxWidth="lg">
                    {/* Header */}
                    <PageHeader
                        title={user?.role === 'doctor' ? '📋 All Bookings' : '📋 My Bookings'}
                    />

                    {/* Role Indicator */}
                    <Box sx={{ mb: 3 }}>
                        <Chip
                            icon={user?.role === 'doctor' ? <PersonIcon /> : <EventIcon />}
                            label={user?.role === 'doctor' ? '🩺 Doctor View - All Bookings' : '👤 Patient View - My Bookings'}
                            color={user?.role === 'doctor' ? 'primary' : 'secondary'}
                            variant="outlined"
                        />
                    </Box>

                    {/* Filter Tabs */}
                    <Paper sx={{ mb: 3 }}>
                        <Tabs
                            value={tabValue}
                            onChange={(_, newValue) => setTabValue(newValue)}
                            variant="fullWidth"
                        >
                            <Tab
                                label={`All (${statusCounts.all})`}
                                value="all"
                                icon={<EventIcon />}
                                iconPosition="start"
                            />
                            <Tab
                                label={`Today (${statusCounts.today})`}
                                value="today"
                                icon={<TodayIcon />}
                                iconPosition="start"
                                sx={{ color: statusCounts.today > 0 ? 'warning.main' : 'inherit' }}
                            />
                            <Tab
                                label={`Upcoming (${statusCounts.upcoming})`}
                                value="upcoming"
                                icon={<ScheduleIcon />}
                                iconPosition="start"
                                sx={{ color: statusCounts.upcoming > 0 ? 'success.main' : 'inherit' }}
                            />
                            <Tab
                                label={`Completed (${statusCounts.past})`}
                                value="past"
                                icon={<CheckCircleIcon />}
                                iconPosition="start"
                            />
                        </Tabs>
                    </Paper>

                    {/* Booking List */}
                    {filteredBookings.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                            <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                                {tabValue === 'all' ? 'No bookings yet' : `No ${tabValue} bookings`}
                            </Typography>
                            {user?.role === 'patient' && tabValue === 'all' && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Go to Book Appointment to make your first booking!
                                </Typography>
                            )}
                        </Paper>
                    ) : (
                        <Stack spacing={2}>
                            {filteredBookings.map((booking) => (
                                <BookingCard
                                    key={booking.id}
                                    booking={booking}
                                    isDoctor={user?.role === 'doctor'}
                                    onDelete={() => setDeleteId(booking.id)} // callback handler
                                    isDeleting={deleteMutation.isPending}
                                    onReschedule={() => setRescheduleBooking(booking)} // callback handler
                                />
                            ))}
                        </Stack>
                    )}
                </Container>
            </Box>

            {/* Delete Confirmation Dialog */}
            <ConfirmDeleteDialog
                open={!!deleteId} // isOpen null check by deleteId (if not null, open)
                onClose={() => setDeleteId(null)} // onClose handler resets deleteId
                onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
                loading={deleteMutation.isPending}
                title="Cancel Booking"
                message="Are you sure you want to cancel this booking?  The time slot will become available again."
            />

            {/* Reschedule Dialog */}
            <RescheduleDialog 
                open={!!rescheduleBooking} // isOpen null check by rescheduleBooking (if not null, open)
                booking={rescheduleBooking} // pass the booking to be rescheduled
                onClose={() => setRescheduleBooking(null)} // onClose handler resets rescheduleBooking
            />
        </>
    );
}

// Both doctor and patient can access
export default withProtectedRoute(BookingHistoryPage, {
    allowedRoles: ['doctor', 'patient']
});