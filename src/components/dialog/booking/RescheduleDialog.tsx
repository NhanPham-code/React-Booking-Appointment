'use client';

import React, { useEffect, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, Typography, CircularProgress, Chip,
    Alert, Stack,
    AlertTitle,
    Divider,
    Grid
} from '@mui/material';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { timeSlotService } from '@/src/services/timeSlotServices';
import { bookingService } from '@/src/services/bookingServices';
import { QUERY_KEYS } from '@/src/constants/queryKey';
import { BookingWithStatus } from '@/src/utils/bookingUtils';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import NotesIcon from '@mui/icons-material/Notes';

interface RescheduleDialogProps {
    open: boolean;
    onClose: () => void;
    booking: BookingWithStatus | null;
}

export default function RescheduleDialog({ open, onClose, booking }: RescheduleDialogProps) {
    const queryClient = useQueryClient();

    // Default to the booking's current date if available
    const [selectedDate, setSelectedDate] = useState<string>(
        booking ? dayjs(booking.startTime).format('YYYY-MM-DD') : ''
    );
    const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

    useEffect(() => {
        if (open && booking) {
            const initialDate = dayjs(booking.startTime).format('YYYY-MM-DD');
            setSelectedDate(initialDate);
            setSelectedSlotId(null);
        }
    }, [booking, open]);

    // Fetch Available Slots for the selected date
    const { data: slots = [], isFetching, isPending } = useQuery({
        queryKey: QUERY_KEYS.TIME_SLOTS.BY_DATE(booking?.doctorId, selectedDate),
        queryFn: () => timeSlotService.getByDate(booking?.doctorId, selectedDate),
        enabled: !!selectedDate && open, // Only fetch when dialog is open and date is selected
        placeholderData: keepPreviousData,
    });

    // Filter out booked slots and past slots
    const nowDate = new Date();

    // Filter for only AVAILABLE slots
    const availableSlots = slots.filter(slot => {
        if (!slot.startTime) return false;
        const slotTime = new Date(slot.startTime);
        return !slot.is_booked && slotTime > nowDate;
    });

    // Mutation to update the booking
    const rescheduleMutation = useMutation({
        mutationFn: () => bookingService.reschedule(booking, selectedSlotId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS.ALL });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_SLOTS.ALL });
            handleClose();
            toast.success('Appointment rescheduled successfully');
        },
        onError: (error: Error) => {
            const axiosError = error as AxiosError<{ detail: string }>;
            const errorMessage = axiosError.response?.data?.detail || error.message;
            toast.error(errorMessage);
        }
    });

    const handleConfirm = () => {
        if (selectedSlotId) {
            rescheduleMutation.mutate();
        }
    };

    const handleClose = () => {
        setSelectedSlotId(null);
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
                    <Alert
                        severity="info"
                        icon={false}
                        sx={{
                            mb: 2,
                            border: '1px solid',
                            borderColor: 'info.light',
                            '& .MuiAlert-message': { width: '100%' }
                        }}
                    >
                        <AlertTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EventIcon fontSize="small" />
                            Current Appointment Details
                        </AlertTitle>

                        <Divider sx={{ my: 1, borderColor: 'info.light', opacity: 0.5 }} />

                        <Grid container spacing={2}>
                            <Grid sx={{ xs: 12, sm: 6 }}>
                                <Stack spacing={1}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                                            DATE & TIME
                                        </Typography>
                                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <EventIcon sx={{ fontSize: 16, color: 'info.main' }} />
                                            {new Date(booking.startTime).toLocaleDateString('en-US', {
                                                weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </Typography>
                                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                            <AccessTimeIcon sx={{ fontSize: 16, color: 'info.main' }} />
                                            {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {' - '}
                                            {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Grid>

                            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

                            <Grid sx={{ xs: 12, sm: 6 }}>
                                <Stack spacing={1}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                                            INVOLVED PARTIES
                                        </Typography>

                                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <MedicalServicesIcon sx={{ fontSize: 16, color: 'error.main' }} />
                                            Dr. {booking.doctorName}
                                        </Typography>

                                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                            <PersonIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                            {booking.patientName}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Grid>

                            {booking.notes && (
                                <Grid sx={{ xs: 12 }}>
                                    <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.6)', p: 1, borderRadius: 1 }}>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <NotesIcon sx={{ fontSize: 14 }} />
                                            NOTES
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                                            {booking.notes}
                                        </Typography>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </Alert>

                    <Box>
                        <Typography variant="subtitle2" gutterBottom>Select New Date</Typography>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Date"
                                format='YYYY-MM-DD'
                                // Convert (YYYY-MM-DD)
                                value={selectedDate ? dayjs(selectedDate, 'YYYY-MM-DD') : null}
                                onChange={(newValue) => {
                                    if (newValue) {
                                        setSelectedDate(newValue.format('YYYY-MM-DD'));
                                        setSelectedSlotId(null);
                                    }
                                }}

                                // Disable dates before today
                                minDate={dayjs()}

                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: 'small',
                                        helperText: "Select a day to see available slots"
                                    }
                                }}
                            />
                        </LocalizationProvider>
                    </Box>

                    <Box sx={{ position: 'relative', minHeight: '80px' }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Available Time Slots
                            {isFetching && <CircularProgress size={14} sx={{ ml: 1 }} />}
                        </Typography>

                        {/* 1. Chỉ hiện loading to khi thực sự không có gì trong tay (lần đầu tiên) */}
                        {isPending && availableSlots.length === 0 ? (
                            <Box display="flex" justifyContent="center" p={2}><CircularProgress size={24} /></Box>
                        ) : (
                            /* 2. Luôn render danh sách, chỉ thay đổi độ mờ khi đang fetch */
                            <Box
                                display="flex"
                                gap={1}
                                flexWrap="wrap"
                                sx={{
                                    opacity: isFetching ? 0.6 : 1,
                                    transition: 'opacity 0.2s',
                                    pointerEvents: isFetching ? 'none' : 'auto' // Tránh chọn nhầm khi đang load
                                }}
                            >
                                {availableSlots.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                        No available slots for this date.
                                    </Typography>
                                ) : (
                                    availableSlots.map((slot) => (
                                        <Chip
                                            key={slot.id}
                                            label={`${dayjs(slot.startTime).format('HH:mm')} - ${dayjs(slot.endTime).format('HH:mm')}`}
                                            onClick={() => setSelectedSlotId(slot.id)}
                                            color={selectedSlotId === slot.id ? "primary" : "default"}
                                            variant={selectedSlotId === slot.id ? "filled" : "outlined"}
                                            sx={{ cursor: 'pointer' }}
                                        />
                                    ))
                                )}
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