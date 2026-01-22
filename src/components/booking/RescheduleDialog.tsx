'use client';

import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, Typography, CircularProgress, Chip,
    Alert, Stack
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeSlotService } from '@/src/services/timeSlotServices';
import { bookingService } from '@/src/services/bookingServices';
import { QUERY_KEYS } from '@/src/constants/queryKey';
import { BookingWithStatus } from '@/src/utils/bookingUtils';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';

interface RescheduleDialogProps {
    open: boolean;
    onClose: () => void;
    booking: BookingWithStatus | null;
}

export default function RescheduleDialog({ open, onClose, booking }: RescheduleDialogProps) {
    const queryClient = useQueryClient();

    // Default to the booking's current date if available
    const [selectedDate, setSelectedDate] = useState<string>(
        booking ? new Date(booking.startTime).toISOString().split('T')[0] : ''
    );
    const [selectedSlotId, setSelectedSlotId] = useState<string>('');
    const [selectedTimeRange, setSelectedTimeRange] = useState<{ start: string, end: string }>({ start: '', end: '' });

    // 1. Fetch Available Slots for the selected date
    const { data: slots = [], isLoading: isLoadingSlots } = useQuery({
        queryKey: QUERY_KEYS.TIME_SLOTS.BY_DATE(selectedDate),
        queryFn: () => timeSlotService.getByDate(selectedDate),
        enabled: !!selectedDate && open, // Only fetch when dialog is open
    });

    // Filter out booked slots and past slots
    const nowDate = new Date();

    // Filter for only AVAILABLE slots
    const availableSlots = slots.filter(slot => {
        if (!slot.startTime) return false;
        const slotTime = new Date(slot.startTime);
        return !slot.isBooked && slotTime > nowDate;
    });

    // Mutation to update the booking
    const rescheduleMutation = useMutation({
        mutationFn: () => bookingService.reschedule(booking, selectedSlotId, selectedTimeRange?.start, selectedTimeRange?.end),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS.ALL });
            // Also refresh slots so the old one becomes free and new one becomes booked
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_SLOTS.ALL });
            handleClose();
        }
    });

    const handleConfirm = () => {
        if (selectedTimeRange.start && selectedTimeRange.end && selectedSlotId) {
            rescheduleMutation.mutate();
        }
    };

    const handleClose = () => {
        setSelectedSlotId('');
        setSelectedTimeRange({ start: '', end: '' });
        onClose();
    };

    if (!booking) return null;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventRepeatIcon color="primary" />
                Reschedule Appointment
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={3}>
                    {/* Current Booking Info */}
                    <Alert severity="info" icon={false} sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Current Appointment:
                        </Typography>
                        <Typography variant="body2">
                            * {new Date(booking.startTime).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2">
                            * {new Date(booking.startTime).toLocaleString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                    </Alert>

                    {/* Step 1: Pick Date */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>Select New Date</Typography>

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Date"
                                // Convert your string state (YYYY-MM-DD) to a dayjs object for the picker
                                value={selectedDate ? dayjs(selectedDate) : null}

                                // When user picks a date, convert it back to YYYY-MM-DD string
                                onChange={(newValue) => {
                                    if (newValue) {
                                        setSelectedDate(newValue.format('YYYY-MM-DD'));
                                        setSelectedSlotId(''); // Reset slot on date change
                                    }
                                }}

                                // Disable dates before today
                                minDate={dayjs()}

                                // Make it look nice and full width
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: 'small', // Matches the compact dialog style
                                        helperText: "Select a day to see available slots"
                                    }
                                }}
                            />
                        </LocalizationProvider>
                    </Box>

                    {/* Step 2: Pick Slot */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>Available Time Slots</Typography>

                        {isLoadingSlots ? (
                            <Box display="flex" justifyContent="center" p={2}><CircularProgress size={24} /></Box>
                        ) : availableSlots.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                No available slots for this date. Please try another day.
                            </Typography>
                        ) : (
                            <Box display="flex" gap={1} flexWrap="wrap">
                                {availableSlots.map((slot) => {
                                    const startTime = new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    const endTime = new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    const isSelected = selectedSlotId === slot.id;

                                    return (
                                        <Chip
                                            key={slot.id}
                                            label={`${startTime} - ${endTime}`}
                                            onClick={() => {
                                                setSelectedSlotId(slot.id);
                                                setSelectedTimeRange({ start: slot.startTime, end: slot.endTime });
                                            }}
                                            color={isSelected ? "primary" : "default"}
                                            variant={isSelected ? "filled" : "outlined"}
                                            sx={{ cursor: 'pointer' }}
                                        />
                                    );
                                })}
                            </Box>
                        )}
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} color="inherit">Cancel</Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    disabled={!selectedSlotId || rescheduleMutation.isPending}
                >
                    {rescheduleMutation.isPending ? 'Updating...' : 'Confirm New Time'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}