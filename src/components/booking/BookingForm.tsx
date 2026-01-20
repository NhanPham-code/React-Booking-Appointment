// src/components/booking/BookingForm.tsx
'use client';

import React from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, TextField, Stack, Card, CardContent, Typography, Alert, Divider } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/src/services/bookingServices';
import { timeSlotService } from '@/src/services/timeSlotServices';
import { bookingSchema, BookingFormData } from '@/src/validations/bookingSchema';
import { CreateBookingDTO } from '@/src/models/booking';
import TimeSlotSelector from './TimeSlotSelector';
import DateFilter from '@/src/components/common/DateFilter';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PersonIcon from '@mui/icons-material/Person';
import { QUERY_KEYS } from '@/src/constants/queryKey';

export default function BookingForm() {
    const queryClient = useQueryClient();
    const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
    const [selectedDate, setSelectedDate] = React.useState<string>('');

    const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<BookingFormData>({
        resolver: yupResolver(bookingSchema),
        mode: 'onChange',
        defaultValues: {
            customerName: '',
            phoneNumber: '',
            timeSlotIds: [],
            notes: ''
        }
    });

    const { data: slotsWithStatus = [], isLoading: loadingSlots } = useQuery({
        queryKey: QUERY_KEYS.TIME_SLOTS.BY_DATE(selectedDate),
        queryFn: () => timeSlotService.getSlotsByDateWithStatus(selectedDate),
        enabled: !!selectedDate,
        staleTime: 1 * 60 * 1000,
        refetchInterval: 30000,
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: true,
    });

    const createMutation = useMutation({
        mutationFn: async (data: BookingFormData) => {
            const selectedSlots = slotsWithStatus.filter(
                slot => data.timeSlotIds.includes(slot.id) && !slot.isBooked && !slot.isPast
            );

            if (selectedSlots.length === 0) {
                throw new Error('No valid time slots selected');
            }

            const bookingData: CreateBookingDTO = {
                customerName: data.customerName,
                phoneNumber: data.phoneNumber,
                notes: data.notes || '',
                timeSlots: selectedSlots.map(slot => ({
                    timeSlotId: slot.id,
                    date: slot.date,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                }))
            };

            return bookingService.create(bookingData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS.ALL });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_SLOTS.ALL });
            reset();
            setSuccessMsg('Booking created successfully!');
            setErrorMsg(null);
            setTimeout(() => setSuccessMsg(null), 3000);
        },
        onError: (error: Error) => {
            setErrorMsg(error.message || 'Failed to create booking. Please try again.');
        }
    });

    const onSubmit = (data: BookingFormData) => {
        createMutation.mutate(data);
    };

    // callback for TimeSlotSelector
    const handleTimeSlotChange = (ids: string[]) => {
        setValue('timeSlotIds', ids, { shouldValidate: true });
    };

    // callback for DateFilter
    const handleDateChange = (date: string) => {
        setSelectedDate(date);
        setValue('timeSlotIds', [], { shouldValidate: false });
    };

    const selectedTimeSlotIds = useWatch({
        control,
        name: 'timeSlotIds',
        defaultValue: []
    });

    const selectedSlots = slotsWithStatus.filter(slot => selectedTimeSlotIds?.includes(slot.id));

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={{ xs: 2, sm: 3 }}>
                {/* Step 1: Select Date & Time Slots */}
                <Card>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Typography 
                            variant="h6" 
                            gutterBottom 
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1,
                                fontSize: { xs: '1.1rem', sm: '1.25rem' }
                            }}
                        >
                            <EventAvailableIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                            Step 1: Choose Date & Time
                        </Typography>

                        <DateFilter
                            selectedDate={selectedDate}
                            onChange={handleDateChange}
                        />

                        <TimeSlotSelector
                            slots={slotsWithStatus}
                            selectedIds={selectedTimeSlotIds || []}
                            onChange={handleTimeSlotChange}
                            isLoading={loadingSlots}
                            selectedDate={selectedDate}
                        />

                        {errors.timeSlotIds && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {errors.timeSlotIds.message}
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* Step 2: Customer Information */}
                <Card>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Typography 
                            variant="h6" 
                            gutterBottom 
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1,
                                fontSize: { xs: '1.1rem', sm: '1.25rem' }
                            }}
                        >
                            <PersonIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                            Step 2: Your Information
                        </Typography>

                        {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
                        {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

                        <Stack spacing={2}>
                            <Controller
                                name="customerName"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Customer Name"
                                        placeholder="Enter your full name"
                                        error={!!errors.customerName}
                                        helperText={errors.customerName?.message}
                                        fullWidth
                                        size="small"
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
                                        size="small"
                                    />
                                )}
                            />

                            <Controller
                                name="notes"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Notes (Optional)"
                                        placeholder="Any special requests or notes..."
                                        multiline
                                        rows={3}
                                        fullWidth
                                        size="small"
                                    />
                                )}
                            />

                            <Divider />

                            {/* Summary */}
                            {selectedSlots.length > 0 && (
                                <Box sx={{ 
                                    bgcolor: 'primary.50', 
                                    p: { xs: 1.5, sm: 2 }, 
                                    borderRadius: 2, 
                                    border: '1px solid', 
                                    borderColor: 'primary.200' 
                                }}>
                                    <Typography 
                                        variant="subtitle2" 
                                        color="primary.main" 
                                        gutterBottom 
                                        fontWeight={600}
                                        sx={{ fontSize: { xs: '0.875rem', sm: '0.95rem' } }}
                                    >
                                        📋 Booking Summary
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                                        Date: <strong>{selectedDate}</strong>
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                                        {selectedSlots.length} time slot(s) selected:
                                    </Typography>
                                    <Stack spacing={0.5} sx={{ mt: 1 }}>
                                        {selectedSlots.map(slot => (
                                            <Typography 
                                                key={slot.id} 
                                                variant="body2" 
                                                color="primary.main"
                                                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                                            >
                                                • {slot.startTime} - {slot.endTime}
                                            </Typography>
                                        ))}
                                    </Stack>
                                </Box>
                            )}

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={createMutation.isPending || !selectedSlots.length}
                                sx={{ py: { xs: 1.2, sm: 1.5 } }}
                                fullWidth
                            >
                                {createMutation.isPending ? 'Processing...' : 'Confirm Booking'}
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>
        </Box>
    );
}