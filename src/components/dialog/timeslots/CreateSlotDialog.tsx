'use client';

import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, IconButton, Typography, Box,
    FormControl, InputLabel, Select, MenuItem,
    FormHelperText, Stack, Alert, CircularProgress
} from '@mui/material';
import Grid from '@mui/material/Grid';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { timeSlotService } from '@/src/services/timeSlotServices';
import { timeSlotSchema, TimeSlotFormData } from '@/src/validations/timeSlotSchema';
import { QUERY_KEYS } from '@/src/constants/queryKey';
import DateFilter from '../../common/DateFilter';
import { CreateTimeSlotDTO } from '@/src/models/timeSlot';
import { AxiosError } from "axios";
import { toast } from 'react-toastify';

/**
 * Convert 12-hour time to 24-hour time string.
 * @param hour The hour in 12-hour format.
 * @param minute The minute.
 * @param period 'AM' or 'PM'.
 * @returns Time string in 24-hour format (HH:mm).
 */
function convertTo24Hour(hour: number, minute: number, period: 'AM' | 'PM'): string {
    let hour24 = hour;
    if (period === 'PM' && hour !== 12) hour24 = hour + 12;
    else if (period === 'AM' && hour === 12) hour24 = 0;
    return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}


/**
 * CreateSlotDialog component for adding new time slots.
 */
interface CreateSlotDialogProps {
    open: boolean; // Whether the dialog is open.
    onClose: () => void; // Function to close the dialog.
    initialDate: string | undefined; // Initial date for the time slot in 'YYYY-MM-DD' format.
    doctorId: number | undefined; // ID of the doctor creating the slot.
}

/**
 * CreateSlotDialog component for adding new time slots.
 * @param props Component props.
 * @returns JSX.Element
 */
export default function CreateSlotDialog({ open, onClose, initialDate, doctorId }: CreateSlotDialogProps) {
    const queryClient = useQueryClient();
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

    // Manual Time States
    const [startHour, setStartHour] = React.useState(9);
    const [startMinute, setStartMinute] = React.useState(0);
    const [startPeriod, setStartPeriod] = React.useState<'AM' | 'PM'>('AM');

    const [endHour, setEndHour] = React.useState(10);
    const [endMinute, setEndMinute] = React.useState(0);
    const [endPeriod, setEndPeriod] = React.useState<'AM' | 'PM'>('AM');


    const { control, handleSubmit, setValue, reset, formState: { errors } } = useForm<TimeSlotFormData>({
        resolver: yupResolver(timeSlotSchema),
        mode: 'onChange', // check validate every data change
        defaultValues: {
            date: initialDate,
            startTime: '09:00',
            endTime: '10:00',
        }
    });

    // Watching the date field directly from the form to use in the preview and submission and DateFilter
    const selectedDate = useWatch({
        control,
        name: 'date',
    });

    // Reset form
    useEffect(() => {
        reset({
            date: initialDate || new Date().toISOString().split('T')[0],
            startTime: convertTo24Hour(startHour, startMinute, startPeriod),
            endTime: convertTo24Hour(endHour, endMinute, endPeriod),
        });
        setErrorMsg(null)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialDate, reset, open]);

    // Sync time input to form values
    useEffect(() => {
        // set data to form state with shouldValidate to trigger validate schema
        setValue('startTime', convertTo24Hour(startHour, startMinute, startPeriod), { shouldValidate: true });
    }, [startHour, startMinute, startPeriod, setValue]);

    useEffect(() => {
        setValue('endTime', convertTo24Hour(endHour, endMinute, endPeriod), { shouldValidate: true });
    }, [endHour, endMinute, endPeriod, setValue]);

    // Mutation for creating time slot
    const createMutation = useMutation({
        mutationFn: async (data: CreateTimeSlotDTO) => await timeSlotService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_SLOTS.ALL });
            onClose();
            toast.success("Create new time slot success")
        },
        onError: (error: Error) => {
            const axiosError = error as AxiosError<{ detail: string }>;
            const detail = axiosError.response?.data?.detail;

            let errorMessage = detail || 'Failed to create time slot. Please try again.';
            if (Array.isArray(detail)) {
                errorMessage = detail[0]?.msg || errorMessage;
            } else if (typeof detail === 'string') {
                errorMessage = detail;
            }

            setErrorMsg(errorMessage);
            toast.error(errorMessage);

            console.log("Create Time Slot error:", axiosError.response?.data);
        }
    });

    // Form Submission
    const onSubmit = (data: TimeSlotFormData) => {
        // Combine your separate inputs into a "Local Wall Clock" date
        // User selected: "2026-01-21" and "09:00" (Vietnam Time)
        const localStartStr = `${data.date}T${data.startTime}:00`;
        const localEndStr = `${data.date}T${data.endTime}:00`;

        // Convert that "Wall Clock" time to a real JS Date object
        const startObj = new Date(localStartStr);
        const endObj = new Date(localEndStr);

        const createTimeSlotDTO = {
            startTime: startObj.toISOString(),
            endTime: endObj.toISOString(),
            doctor_id: doctorId
        }

        createMutation.mutate(createTimeSlotDTO);
    };

    // Setup for hours and minutes options
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = [0, 30];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: { borderRadius: 2 }
                }
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>Add Time Slot</Typography>
                </Box>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

                    {/* Date Picker */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>Date</Typography>
                        {/*Date Filter Component*/}
                        <DateFilter
                            selectedDate={selectedDate}
                            onChange={(date: string) => setValue('date', date)}
                            minDate={new Date().toISOString().split('T')[0]}
                        />
                    </Box>

                    {/* Start Time Section */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom color="text.secondary">Start Time</Typography>

                        <Grid container spacing={1}>
                            <Grid size={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Hour</InputLabel>
                                    <Select value={startHour} label="Hour" onChange={(e) => setStartHour(Number(e.target.value))}>
                                        {hours.map(h => <MenuItem key={h} value={h}>{h}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Min</InputLabel>
                                    <Select value={startMinute} label="Min" onChange={(e) => setStartMinute(Number(e.target.value))}>
                                        {minutes.map(m => <MenuItem key={m} value={m}>{m.toString().padStart(2, '0')}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Period</InputLabel>
                                    <Select value={startPeriod} label="Period" onChange={(e) => setStartPeriod(e.target.value as 'AM' | 'PM')}>
                                        <MenuItem value="AM">AM</MenuItem>
                                        <MenuItem value="PM">PM</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                        {errors.startTime && <FormHelperText error>{errors.startTime.message}</FormHelperText>}
                    </Box>

                    {/* End Time Section */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom color="text.secondary">End Time</Typography>

                        <Grid container spacing={1}>
                            <Grid size={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Hour</InputLabel>
                                    <Select value={endHour} label="Hour" onChange={(e) => setEndHour(Number(e.target.value))}>
                                        {hours.map(h => <MenuItem key={h} value={h}>{h}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Min</InputLabel>
                                    <Select value={endMinute} label="Min" onChange={(e) => setEndMinute(Number(e.target.value))}>
                                        {minutes.map(m => <MenuItem key={m} value={m}>{m.toString().padStart(2, '0')}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Period</InputLabel>
                                    <Select value={endPeriod} label="Period" onChange={(e) => setEndPeriod(e.target.value as 'AM' | 'PM')}>
                                        <MenuItem value="AM">AM</MenuItem>
                                        <MenuItem value="PM">PM</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                        {errors.endTime && <FormHelperText error>{errors.endTime.message}</FormHelperText>}
                    </Box>

                    {/* Preview Box */}
                    <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1, border: '1px dashed', borderColor: 'primary.200' }}>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            Preview
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="primary.main">
                            {selectedDate} • {convertTo24Hour(startHour, startMinute, startPeriod)} - {convertTo24Hour(endHour, endMinute, endPeriod)}
                        </Typography>
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
                <Button onClick={onClose} disabled={createMutation.isPending} color="inherit">Cancel</Button>
                <Button
                    onClick={handleSubmit(onSubmit)}
                    variant="contained"
                    disableElevation
                    disabled={createMutation.isPending}
                    startIcon={createMutation.isPending ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    {createMutation.isPending ? 'Creating...' : 'Confirm Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}