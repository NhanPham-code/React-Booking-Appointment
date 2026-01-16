// src/components/timeslots/TimeSlotForm.tsx
'use client';

import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, TextField, Stack, Card, CardContent, Typography, Alert } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { timeSlotService } from '@/src/services/timeSlotServices';
import { timeSlotSchema, TimeSlotFormData } from '@/src/validations/timeSlotSchema';
import AddIcon from '@mui/icons-material/Add';
import React from 'react';
import { QUERY_KEYS } from '@/src/constants/queryKey';

export default function TimeSlotForm() {
    const queryClient = useQueryClient();
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
    const [successMsg, setSuccessMsg] = React. useState<string | null>(null);

    // Lấy ngày hôm nay để set min date
    const today = new Date().toISOString().split('T')[0];

    const { control, handleSubmit, reset, formState: { errors } } = useForm<TimeSlotFormData>({
        resolver: yupResolver(timeSlotSchema),
        defaultValues:  {
            date:  today,
            startTime: '09:00',
            endTime: '10:00',
        }
    });

    const createMutation = useMutation({
        mutationFn: timeSlotService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_SLOTS.ALL }); // thông báo refesh lại TimeSlot list để cập nhật SlotTime mới
            reset({ date: today, startTime: '09:00', endTime: '10:00' });
            setSuccessMsg('Time slot created successfully!');
            setErrorMsg(null);
            setTimeout(() => setSuccessMsg(null), 3000);
        },
        onError: (error:  Error) => {
            setErrorMsg(error.message || 'Failed to create time slot.');
        }
    });

    const onSubmit = (data: TimeSlotFormData) => {
        setErrorMsg(null);
        createMutation.mutate(data); // gọi create mutation
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems:  'center', gap: 1 }}>
                    <AddIcon color="primary" />
                    Create New Time Slot
                </Typography>

                {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
                {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={2}>
                        <Controller
                            name="date"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {... field}
                                    type="date"
                                    label="Date"
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ min: today }}
                                    error={!!errors. date}
                                    helperText={errors.date?.message}
                                    fullWidth
                                />
                            )}
                        />

                        <Stack direction="row" spacing={2}>
                            <Controller
                                name="startTime"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        type="time"
                                        label="Start Time"
                                        InputLabelProps={{ shrink: true }}
                                        error={!!errors.startTime}
                                        helperText={errors.startTime?. message}
                                        fullWidth
                                    />
                                )}
                            />
                            <Controller
                                name="endTime"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {... field}
                                        type="time"
                                        label="End Time"
                                        InputLabelProps={{ shrink: true }}
                                        error={!! errors.endTime}
                                        helperText={errors. endTime?.message}
                                        fullWidth
                                    />
                                )}
                            />
                        </Stack>

                        <Typography variant="caption" color="text. secondary">
                            ⚠️ Note: You can only create time slots for future dates and times.
                        </Typography>

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={createMutation.isPending}
                            startIcon={<AddIcon />}
                        >
                            {createMutation.isPending ? 'Creating...' :  'Create Time Slot'}
                        </Button>
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
}