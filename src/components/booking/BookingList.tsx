// src/components/booking/BookingList.tsx
'use client';

import { List, ListItem, IconButton, Paper, Typography, Chip, Box, Avatar, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/src/services/bookingServices';
import { IBooking } from '@/src/models/booking';
import { QUERY_KEYS } from '@/src/constants/queryKey';

interface BookingListProps {
    bookings: IBooking[];
}

export default function BookingList({ bookings }: BookingListProps) {
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: bookingService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS.ALL });
            queryClient.invalidateQueries({ queryKey:  QUERY_KEYS.TIME_SLOTS.ALL });
        }
    });

    if (bookings.length === 0) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography color="text.secondary">
                    No bookings yet.  Be the first to book! 
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ maxHeight: 600, overflow: 'auto' }}>
            <List>
                {bookings.map((booking) => (
                    <ListItem
                        key={booking.id}
                        secondaryAction={
                            <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={() => deleteMutation. mutate(booking. id)}
                                color="error"
                                disabled={deleteMutation. isPending}
                            >
                                <DeleteIcon />
                            </IconButton>
                        }
                        divider
                        sx={{ alignItems: 'flex-start', py: 2 }}
                    >
                        <Avatar sx={{ mr: 2, mt: 0.5, bgcolor: 'primary.main' }}>
                            {booking.customerName. charAt(0).toUpperCase()}
                        </Avatar>
                        
                        {/* FIX: Không dùng secondary prop, tự render content */}
                        <Box sx={{ flex: 1 }}>
                            {/* Primary - Customer Name */}
                            <Typography fontWeight="bold">
                                {booking.customerName}
                            </Typography>
                            
                            {/* Secondary - Phone & Notes */}
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                📞 {booking.phoneNumber}
                                {booking.notes && ` • 📝 ${booking.notes}`}
                            </Typography>
                            
                            {/* Time Slots - Dùng Box thay vì để trong secondary */}
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {booking.timeSlots.map((slot, index) => (
                                    <Chip
                                        key={index}
                                        label={`${slot.date} | ${slot.startTime} - ${slot. endTime}`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        sx={{ mt: 0.5 }}
                                    />
                                ))}
                            </Stack>
                        </Box>
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
}