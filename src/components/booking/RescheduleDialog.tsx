// src/components/booking/RescheduleDialog.tsx
'use client';

import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Alert,
    Stack,
    Divider,
    Chip,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/src/services/bookingServices';
import { timeSlotService } from '@/src/services/timeSlotServices';
import { IBooking } from '@/src/models/booking';
import TimeSlotSelector from './TimeSlotSelector';
import DateFilter from '../common/DateFilter';
import { QUERY_KEYS } from '@/src/constants/queryKey';

interface RescheduleDialogProps {
    booking: IBooking | null;
    open: boolean;
    onClose: () => void;
}

export default function RescheduleDialog({ booking, open, onClose }: RescheduleDialogProps) {
    const queryClient = useQueryClient();
    const [selectedDate, setSelectedDate] = React.useState<string>('');
    const [selectedTimeSlotIds, setSelectedTimeSlotIds] = React.useState<string[]>([]);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

    // Fetch slots logic...
    const { data: slotsWithStatus = [], isLoading: loadingSlots } = useQuery({
        queryKey: QUERY_KEYS.TIME_SLOTS.BY_DATE(selectedDate),
        queryFn: () => timeSlotService.getSlotsByDateWithStatus(selectedDate),
        enabled: !!selectedDate && open,
        staleTime: 1 * 60 * 1000,
    });

    const rescheduleMutation = useMutation({
        mutationFn: async () => {
            if (!booking) throw new Error('No booking selected');
            const selectedSlots = slotsWithStatus.filter(
                slot => selectedTimeSlotIds.includes(slot.id) && !slot.isBooked && !slot.isPast
            );

            if (selectedSlots.length === 0) throw new Error('Please select valid time slots');

            const newTimeSlots = selectedSlots.map(slot => ({
                timeSlotId: slot.id,
                date: slot.date,
                startTime: slot.startTime,
                endTime: slot.endTime,
            }));

            return bookingService.reschedule(booking.id, newTimeSlots);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS.ALL });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_SLOTS.ALL });
            handleClose();
        },
        onError: (error: Error) => {
            setErrorMsg(error.message || 'Failed to reschedule booking');
        }
    });

    const handleClose = () => {
        setSelectedDate('');
        setSelectedTimeSlotIds([]);
        setErrorMsg(null);
        onClose();
    };

    const handleReschedule = () => {
        setErrorMsg(null);
        rescheduleMutation.mutate();
    };

    const selectedSlots = slotsWithStatus.filter(slot =>
        selectedTimeSlotIds.includes(slot.id)
    );

    if (!booking) return null;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            // 1. Removed "fullScreen" prop so it stays as a dialog
            PaperProps={{
                sx: {
                    // 2. Add margin on mobile so it doesn't touch the screen edges
                    m: { xs: 2, sm: 'auto' }, 
                    width: { xs: 'calc(100% - 32px)', sm: '100%' },
                    borderRadius: 2
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventRepeatIcon color="primary" />
                    <Typography variant="h6">Reschedule</Typography>
                </Box>
                <IconButton onClick={handleClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack spacing={2}>
                    {/* Current Booking */}
                    <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Current Booking
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                            {booking.customerName}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                            {booking.timeSlots.map((slot, idx) => (
                                <Chip
                                    key={idx}
                                    label={`${slot.date} | ${slot.startTime}-${slot.endTime}`}
                                    size="small"
                                />
                            ))}
                        </Stack>
                    </Box>

                    {/* Inputs */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>Select New Date</Typography>
                        <DateFilter
                            selectedDate={selectedDate}
                            onChange={(date) => {
                                setSelectedDate(date);
                                setSelectedTimeSlotIds([]);
                            }}
                        />
                        <Box sx={{ mt: 2 }}>
                            <TimeSlotSelector
                                slots={slotsWithStatus}
                                selectedIds={selectedTimeSlotIds}
                                onChange={setSelectedTimeSlotIds}
                                isLoading={loadingSlots}
                                selectedDate={selectedDate}
                            />
                        </Box>
                    </Box>

                    {/* Summary */}
                    {selectedSlots.length > 0 && (
                        <Box sx={{ bgcolor: 'primary.50', p: 2, borderRadius: 2 }}>
                            <Typography variant="subtitle2" color="primary.main">
                                New Schedule: {selectedDate} ({selectedSlots.length} slots)
                            </Typography>
                        </Box>
                    )}

                    {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose} color="inherit">
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleReschedule}
                    disabled={selectedSlots.length === 0 || rescheduleMutation.isPending}
                >
                    {rescheduleMutation.isPending ? 'Saving...' : 'Confirm'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}