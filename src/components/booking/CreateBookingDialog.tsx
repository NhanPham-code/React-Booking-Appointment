'use client';

import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, IconButton, TextField, Stack, Typography, Box, Alert, Chip, CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/src/services/bookingServices';
import { CreateBookingDTO } from '@/src/models/booking';
import { ITimeSlot } from '@/src/models/timeSlot';
import { useAuth } from '@/src/context/AuthContext';
import { QUERY_KEYS } from '@/src/constants/queryKey';
import { useRouter } from 'next/navigation';
import { bookingSchema, BookingFormData } from '@/src/validations/bookingSchema';

interface CreateBookingDialogProps {
    open: boolean; // Whether the dialog is open
    onClose: () => void; // Function to close the dialog
    selectedSlot:  ITimeSlot | null; // The selected time slot for booking
}

/**
 * CreateBookingDialog component to handle booking creation.
 * @param param0 Component props.
 * @returns JSX.Element
 */
export default function CreateBookingDialog({ open, onClose, selectedSlot }: CreateBookingDialogProps) {
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [error, setError] = React.useState<string | null>(null);

    const { control, handleSubmit, reset, formState: { errors } } = useForm<BookingFormData>({
        resolver: yupResolver(bookingSchema),
        defaultValues: {
            customerName: user?.fullName || '',
            phoneNumber:  '',
            notes: ''
        }
    });

    // Reset form when dialog opens with new slot
    React.useEffect(() => {
        if (open && user) {
            reset({
                customerName: user.fullName || '',
                phoneNumber: '',
                notes: ''
            });
            setError(null);
        }
    }, [open, user, reset]);

    const createMutation = useMutation({
        mutationFn: async (data: BookingFormData) => {
            if (!user || !selectedSlot) {
                throw new Error('Missing user or slot information');
            }

            const bookingData: CreateBookingDTO = {
                customerName: data.customerName,
                phoneNumber: data.phoneNumber,
                notes: data.notes || '',
                createdById: user.id,
                timeSlotId: selectedSlot.id,
                startTime: selectedSlot.startTime,
                endTime: selectedSlot.endTime
            };

            return bookingService.create(bookingData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS.ALL });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_SLOTS.ALL });
            onClose();
            // Navigate to my bookings page
            router.push('/booking-history');
        },
        onError: (err:  Error) => {
            setError(err.message || 'Failed to create booking');
        }
    });

    const onSubmit = (data: BookingFormData) => {
        createMutation.mutate(data);
    };

    if (! selectedSlot) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                        <EventAvailableIcon color="primary" />
                        <Typography variant="h6">Book Appointment</Typography>
                    </Stack>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent dividers>
                    <Stack spacing={3}>
                        {/* Selected Slot Info */}
                        <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.200' }}>
                            <Typography variant="subtitle2" color="primary.main" gutterBottom fontWeight={600}>
                                📅 Selected Time Slot
                            </Typography>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Chip 
                                    icon={<AccessTimeIcon />}
                                    label={new Date(selectedSlot.startTime).toLocaleDateString()}
                                    color="primary"
                                    variant="outlined"
                                />
                                <Typography variant="body2">
                                    {new Date(selectedSlot.startTime).toLocaleTimeString([], { hour: '2-digit', minute:  '2-digit' })}
                                    {' - '}
                                    {new Date(selectedSlot.endTime).toLocaleTimeString([], { hour: '2-digit', minute:  '2-digit' })}
                                </Typography>
                            </Stack>
                        </Box>

                        {error && <Alert severity="error">{error}</Alert>}

                        {/* Form Fields */}
                        <Controller
                            name="customerName"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Your Name"
                                    placeholder="Enter your full name"
                                    error={!!errors.customerName}
                                    helperText={errors. customerName?.message}
                                    fullWidth
                                />
                            )}
                        />

                        <Controller
                            name="phoneNumber"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Phone Number"
                                    placeholder="Enter your phone number"
                                    error={!!errors.phoneNumber}
                                    helperText={errors.phoneNumber?.message}
                                    fullWidth
                                />
                            )}
                        />

                        <Controller
                            name="notes"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {... field}
                                    label="Notes (Optional)"
                                    placeholder="Any special requests..."
                                    multiline
                                    rows={3}
                                    fullWidth
                                />
                            )}
                        />
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} disabled={createMutation.isPending}>
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={createMutation.isPending}
                        startIcon={createMutation.isPending ? <CircularProgress size={16} /> : <EventAvailableIcon />}
                    >
                        {createMutation.isPending ? 'Booking...' : 'Confirm Booking'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}