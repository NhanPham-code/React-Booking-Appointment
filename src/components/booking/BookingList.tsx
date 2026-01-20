// src/components/booking/BookingList.tsx
'use client';

import { List, ListItem, IconButton, Paper, Typography, Chip, Box, Avatar, Stack, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TodayIcon from '@mui/icons-material/Today';
import EventIcon from '@mui/icons-material/Event';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { bookingService } from '@/src/services/bookingServices';
import { IBooking } from '@/src/models/booking';
import { QUERY_KEYS } from '@/src/constants/queryKey';
import RescheduleDialog from './RescheduleDialog';
import React from 'react';
import { enrichBookingWithStatus, sortBookingsByStatus, BookingWithStatus } from '@/src/utils/bookingUtils';

export default function BookingList() {
    const queryClient = useQueryClient();
    const [rescheduleBooking, setRescheduleBooking] = React.useState<IBooking | null>(null);

    const { data: bookings = [], isLoading } = useQuery({
        queryKey: QUERY_KEYS.BOOKINGS.ALL,
        queryFn: bookingService.getAll,
    });

    // Enrich bookings with status và sort
    const enrichedBookings = React.useMemo(() => {
        // Chỉ tính toán khi có data
        if (!bookings.length) return [];
        const withStatus = bookings.map(enrichBookingWithStatus);
        return sortBookingsByStatus(withStatus);
    }, [bookings]);

    const deleteMutation = useMutation({
        mutationFn: bookingService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS.ALL });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_SLOTS.ALL });
        }
    });

    // Group bookings by status
    const groupedBookings = React.useMemo(() => {
        return {
            today: enrichedBookings.filter(b => b.status === 'today'),
            upcoming: enrichedBookings.filter(b => b.status === 'upcoming'),
            past: enrichedBookings.filter(b => b.status === 'past')
        };
    }, [enrichedBookings]);

    // 1. Loading State: loading
    if (isLoading) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Paper>
        );
    }

    // 2. Empty State: No data
    if (bookings.length === 0) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography color="text.secondary">
                    No bookings yet. Be the first to book!
                </Typography>
            </Paper>
        );
    }

    const renderBookingItem = (booking: BookingWithStatus) => (
        <ListItem
            key={booking.id}
            secondaryAction={
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    {/* Reschedule button */}
                    <IconButton
                        edge="end"
                        aria-label="reschedule"
                        onClick={() => setRescheduleBooking(booking)}
                        color="primary"
                        disabled={booking.status === 'past' || deleteMutation.isPending}
                        size="small"
                    >
                        <EventRepeatIcon fontSize="small" />
                    </IconButton>

                    {/* Delete button */}
                    <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => deleteMutation.mutate(booking.id)}
                        color="error"
                        disabled={deleteMutation.isPending}
                        size="small"
                    >
                        {/* Hiển thị loading icon nhỏ trên nút xóa nếu đang xóa item này (optional enhancement) */}
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Stack>
            }
            divider
            sx={{
                alignItems: 'flex-start',
                py: 2,
                opacity: booking.status === 'past' ? 0.7 : 1,
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 0 }
            }}
        >
            <Stack direction="row" spacing={2} sx={{ flex: 1, width: '100%' }}>
                <Avatar sx={{
                    bgcolor: booking.status === 'past' ? 'grey.400' : 'primary.main',
                    display: { xs: 'none', sm: 'flex' }
                }}>
                    {booking.customerName.charAt(0).toUpperCase()}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        sx={{ mb: 0.5 }}
                    >
                        <Typography fontWeight="bold" sx={{ wordBreak: 'break-word' }}>
                            {booking.customerName}
                        </Typography>
                        <Chip
                            size="small"
                            label={booking.statusLabel}
                            color={booking.statusColor}
                            icon={
                                booking.status === 'today' ? <TodayIcon /> :
                                    booking.status === 'upcoming' ? <EventIcon /> :
                                        <CheckCircleIcon />
                            }
                            sx={{ height: 24 }}
                        />
                    </Stack>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1, wordBreak: 'break-word' }}
                    >
                        📞 {booking.phoneNumber}
                        {booking.notes && ` • 📝 ${booking.notes}`}
                    </Typography>

                    <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                    >
                        {booking.timeSlots.map((slot, index) => {
                            const slotEndDateTime = new Date(`${slot.date}T${slot.endTime}`);
                            const isPast = slotEndDateTime < new Date();

                            return (
                                <Chip
                                    key={index}
                                    label={`${slot.date} | ${slot.startTime} - ${slot.endTime}`}
                                    size="small"
                                    color={isPast ? 'default' : 'primary'}
                                    variant="outlined"
                                    sx={{
                                        mt: 0.5,
                                        opacity: isPast ? 0.6 : 1,
                                        fontSize: { xs: '0.7rem', sm: '0.8125rem' }
                                    }}
                                />
                            );
                        })}
                    </Stack>
                </Box>
            </Stack>
        </ListItem>
    );

    return (
        <>
            <Paper sx={{ maxHeight: 600, overflow: 'auto', position: 'relative' }}>
                {/* Loading overlay khi đang xóa (Optional UX improvement) */}
                {deleteMutation.isPending && (
                    <Box sx={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        bgcolor: 'rgba(255,255,255,0.7)', zIndex: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <CircularProgress size={30} />
                    </Box>
                )}

                <List sx={{ p: 0 }}>
                    {groupedBookings.today.length > 0 && (
                        <>
                            <Box sx={{ px: 2, py: 1.5, bgcolor: 'warning.50', borderBottom: '1px solid', borderColor: 'divider', position: 'sticky', top: 0, zIndex: 1 }}>
                                <Typography variant="subtitle2" fontWeight={600} color="warning.dark">
                                    <TodayIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 0.5 }} />
                                    Today ({groupedBookings.today.length})
                                </Typography>
                            </Box>
                            {groupedBookings.today.map(renderBookingItem)}
                        </>
                    )}

                    {groupedBookings.upcoming.length > 0 && (
                        <>
                            <Box sx={{ px: 2, py: 1.5, bgcolor: 'success.50', borderBottom: '1px solid', borderColor: 'divider', position: 'sticky', top: 0, zIndex: 1 }}>
                                <Typography variant="subtitle2" fontWeight={600} color="success.dark">
                                    <EventIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 0.5 }} />
                                    Upcoming ({groupedBookings.upcoming.length})
                                </Typography>
                            </Box>
                            {groupedBookings.upcoming.map(renderBookingItem)}
                        </>
                    )}

                    {groupedBookings.past.length > 0 && (
                        <>
                            <Box sx={{ px: 2, py: 1.5, bgcolor: 'grey.100', borderBottom: '1px solid', borderColor: 'divider', position: 'sticky', top: 0, zIndex: 1 }}>
                                <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                                    <CheckCircleIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 0.5 }} />
                                    Completed ({groupedBookings.past.length})
                                </Typography>
                            </Box>
                            {groupedBookings.past.map(renderBookingItem)}
                        </>
                    )}
                </List>
            </Paper>

            <RescheduleDialog
                booking={rescheduleBooking}
                open={!!rescheduleBooking}
                onClose={() => setRescheduleBooking(null)}
            />
        </>
    );
}