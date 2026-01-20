// src/components/timeslots/TimeSlotsForm.tsx
'use client';

import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    Box, Button, Stack, Card, CardContent, Typography,
    Alert, Select, MenuItem, FormControl, InputLabel, FormHelperText,
    Grid
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { timeSlotService } from '@/src/services/timeSlotServices';
import { timeSlotSchema, TimeSlotFormData } from '@/src/validations/timeSlotSchema';
import AddIcon from '@mui/icons-material/Add';
import React from 'react';
import { QUERY_KEYS } from '@/src/constants/queryKey';
import DateFilter from '../common/DateFilter';

// Helper functions for AM/PM conversion
function convertTo24Hour(hour: number, minute: number, period: 'AM' | 'PM'): string {
    let hour24 = hour;
    if (period === 'PM' && hour !== 12) {
        hour24 = hour + 12;
    } else if (period === 'AM' && hour === 12) {
        hour24 = 0;
    }
    return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

export default function TimeSlotForm() {
    const queryClient = useQueryClient();
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
    const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

    // AM/PM state for start time
    const [startHour, setStartHour] = React.useState(9);
    const [startMinute, setStartMinute] = React.useState(0);
    const [startPeriod, setStartPeriod] = React.useState<'AM' | 'PM'>('AM');

    // AM/PM state for end time
    const [endHour, setEndHour] = React.useState(10);
    const [endMinute, setEndMinute] = React.useState(0);
    const [endPeriod, setEndPeriod] = React.useState<'AM' | 'PM'>('AM');

    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = React.useState<string>(today);

    const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<TimeSlotFormData>({
        resolver: yupResolver(timeSlotSchema),
        defaultValues: {
            date: today,
            startTime: '09:00',
            endTime: '10:00',
        }
    });

    // Update form values when AM/PM changes
    React.useEffect(() => {
        const time24 = convertTo24Hour(startHour, startMinute, startPeriod);
        setValue('startTime', time24);
    }, [startHour, startMinute, startPeriod, setValue]);

    React.useEffect(() => {
        const time24 = convertTo24Hour(endHour, endMinute, endPeriod);
        setValue('endTime', time24);
    }, [endHour, endMinute, endPeriod, setValue]);

    const createMutation = useMutation({
        mutationFn: timeSlotService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_SLOTS.ALL });
            reset({ date: today, startTime: '09:00', endTime: '10:00' });

            // Reset AM/PM inputs
            setStartHour(9);
            setStartMinute(0);
            setStartPeriod('AM');
            setEndHour(10);
            setEndMinute(0);
            setEndPeriod('AM');

            setSuccessMsg('Time slot created successfully!');
            setErrorMsg(null);
            setTimeout(() => setSuccessMsg(null), 3000);
        },
        onError: (error: Error) => {
            setErrorMsg(error.message || 'Failed to create time slot.');
        }
    });

    const onSubmit = (data: TimeSlotFormData) => {
        setErrorMsg(null);
        createMutation.mutate(data);
    };

    // callback for DateFilter
    const handleDateChange = (date: string) => {
        setSelectedDate(date); // trigger re-render
        setValue('date', date, { shouldValidate: true }); // set new date to RHF to store for submit form
    };

    // Generate hour options (1-12)
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    // Generate minute options (0, 15, 30, 45)
    const minutes = [0, 15, 30, 45];

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AddIcon color="primary" />
                    Create New Time Slot
                </Typography>

                {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
                {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={3}>
                        {/* Date Picker */}
                        <DateFilter 
                            selectedDate={selectedDate}
                            onChange={handleDateChange}
                        />

                        {/* Start Time - AM/PM Format */}
                        <Box>
                            <Typography variant="subtitle2" gutterBottom color="text.secondary">
                                Start Time
                            </Typography>
                            <Grid container spacing={1}>
                                <Grid size={{ xs: 4 }}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Hour</InputLabel>
                                        <Select
                                            value={startHour}
                                            onChange={(e) => setStartHour(e.target.value as number)}
                                            label="Hour"
                                        >
                                            {hours.map(h => (
                                                <MenuItem key={h} value={h}>{h}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 4 }}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Minute</InputLabel>
                                        <Select
                                            value={startMinute}
                                            onChange={(e) => setStartMinute(e.target.value as number)}
                                            label="Minute"
                                        >
                                            {minutes.map(m => (
                                                <MenuItem key={m} value={m}>
                                                    {m.toString().padStart(2, '0')}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 4 }}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Period</InputLabel>
                                        <Select
                                            value={startPeriod}
                                            onChange={(e) => setStartPeriod(e.target.value as 'AM' | 'PM')}
                                            label="Period"
                                        >
                                            <MenuItem value="AM">AM</MenuItem>
                                            <MenuItem value="PM">PM</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            {errors.startTime && (
                                <FormHelperText error>{errors.startTime.message}</FormHelperText>
                            )}
                        </Box>

                        {/* End Time - AM/PM Format */}
                        <Box>
                            <Typography variant="subtitle2" gutterBottom color="text.secondary">
                                End Time
                            </Typography>
                            <Grid container spacing={1}>
                                <Grid size={{ xs: 4 }}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Hour</InputLabel>
                                        <Select
                                            value={endHour}
                                            onChange={(e) => setEndHour(e.target.value as number)}
                                            label="Hour"
                                        >
                                            {hours.map(h => (
                                                <MenuItem key={h} value={h}>{h}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 4 }}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Minute</InputLabel>
                                        <Select
                                            value={endMinute}
                                            onChange={(e) => setEndMinute(e.target.value as number)}
                                            label="Minute"
                                        >
                                            {minutes.map(m => (
                                                <MenuItem key={m} value={m}>
                                                    {m.toString().padStart(2, '0')}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 4 }}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Period</InputLabel>
                                        <Select
                                            value={endPeriod}
                                            onChange={(e) => setEndPeriod(e.target.value as 'AM' | 'PM')}
                                            label="Period"
                                        >
                                            <MenuItem value="AM">AM</MenuItem>
                                            <MenuItem value="PM">PM</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            {errors.endTime && (
                                <FormHelperText error>{errors.endTime.message}</FormHelperText>
                            )}
                        </Box>

                        {/* Preview */}
                        <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                Preview (24-hour format)
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                                {convertTo24Hour(startHour, startMinute, startPeriod)} - {convertTo24Hour(endHour, endMinute, endPeriod)}
                            </Typography>
                        </Box>

                        <Typography variant="caption" color="text.secondary">
                            ⚠️ Note: You can only create time slots for future dates and times.
                        </Typography>

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={createMutation.isPending}
                            startIcon={<AddIcon />}
                            fullWidth
                        >
                            {createMutation.isPending ? 'Creating...' : 'Create Time Slot'}
                        </Button>
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
}