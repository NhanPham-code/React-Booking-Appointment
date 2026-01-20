// src/components/timeslots/TimeSlotsList.tsx
'use client';

import {
    List, ListItem, IconButton, Paper, Typography, Chip, Box, Stack,
    CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { timeSlotService } from '@/src/services/timeSlotServices';
import { QUERY_KEYS } from '@/src/constants/queryKey';
import DateFilter from '@/src/components/common/DateFilter';
import React from 'react';

export default function TimeSlotList() {
    const queryClient = useQueryClient();
    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = React.useState<string>(today);

    const { data: slotsWithStatus = [], isLoading: loadingSlots } = useQuery({
        queryKey: QUERY_KEYS.TIME_SLOTS.BY_DATE(selectedDate),
        queryFn: () => timeSlotService.getSlotsByDateWithStatus(selectedDate),
        enabled: !!selectedDate,
        staleTime: 1 * 60 * 1000, // Cache 1 minute
        refetchInterval: 30000, // Auto refetch 30s
        refetchOnWindowFocus: true,
    });

    const deleteMutation = useMutation({
        mutationFn: timeSlotService.delete,
        onSuccess: () => {
            // Invalidate current date query
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.TIME_SLOTS.BY_DATE(selectedDate)
            });
        }
    });

    // Calculate stats for CURRENT DATE only
    const dateStats = React.useMemo(() => {
        let available = 0;
        let booked = 0;
        let past = 0;

        slotsWithStatus.forEach(slot => {
            if (slot.isPast) {
                past++;
            } else if (slot.isBooked) {
                booked++;
            } else {
                available++;
            }
        });

        return { available, booked, past, total: slotsWithStatus.length };
    }, [slotsWithStatus]);

    return (
        <Paper>
            {/* Date Filter Section */}
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    📅 Select Date to View
                </Typography>
                <DateFilter
                    selectedDate={selectedDate}
                    onChange={setSelectedDate}
                    minDate={null}
                />
            </Box>

            {/* Loading State */}
            {loadingSlots ? (
                <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress size={32} />
                </Box>
            ) : (
                <>
                    {/* Selected Date Stats */}
                    {slotsWithStatus.length > 0 && (
                        <Box sx={{
                            px: 2,
                            py: 1.5,
                            bgcolor: 'success.50',
                            borderBottom: '1px solid',
                            borderColor: 'divider'
                        }}>
                            {/* Date */}
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                <CalendarTodayIcon sx={{ fontSize: 16 }} />
                                <Typography variant="subtitle2" fontWeight={600}>
                                    {selectedDate}
                                </Typography>
                            </Stack>
                            
                            {/* Stats */}
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">

                                <Typography variant="caption" color="text.secondary">
                                    {dateStats.total} slot{dateStats.total > 1 ? 's' : ''}
                                </Typography>

                                {dateStats.available > 0 && (
                                    <>
                                        <Typography variant="caption" color="text.secondary">:</Typography>
                                        <Typography variant="caption" color="success.main" fontWeight={500}>
                                            {dateStats.available} available
                                        </Typography>
                                    </>
                                )}

                                {dateStats.booked > 0 && (
                                    <>
                                        <Typography variant="caption" color="text.secondary">•</Typography>
                                        <Typography variant="caption" color="error.main" fontWeight={500}>
                                            {dateStats.booked} booked
                                        </Typography>
                                    </>
                                )}

                                {dateStats.past > 0 && (
                                    <>
                                        <Typography variant="caption" color="text.secondary">•</Typography>
                                        <Typography variant="caption" color="text.disabled">
                                            {dateStats.past} past
                                        </Typography>
                                    </>
                                )}
                            </Stack>
                        </Box>
                    )}

                    {/* Slots List */}
                    <List sx={{ maxHeight: 450, overflow: 'auto', p: 0 }}>
                        {slotsWithStatus.length === 0 ? (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <EventBusyIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                <Typography color="text.secondary">
                                    No slots available for {selectedDate}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                    Create time slots for this date to get started
                                </Typography>
                            </Box>
                        ) : (
                            slotsWithStatus.map((slot, index) => (
                                <ListItem
                                    key={slot.id}
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            onClick={() => deleteMutation.mutate(slot.id)}
                                            disabled={slot.isBooked || deleteMutation.isPending}
                                            color="error"
                                            size="small"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    }
                                    divider={index < slotsWithStatus.length - 1}
                                    sx={{
                                        opacity: slot.isPast ? 0.6 : slot.isBooked ? 0.85 : 1,
                                        bgcolor: slot.isBooked ? 'error.50' :
                                            slot.isPast ? 'grey.50' :
                                                'transparent',
                                        py: 1.5,
                                        px: 2,
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            bgcolor: slot.isBooked ? 'error.100' :
                                                slot.isPast ? 'grey.100' :
                                                    'action.hover',
                                        }
                                    }}
                                >
                                    <Stack
                                        direction={{ xs: 'column', sm: 'row' }}
                                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                                        spacing={{ xs: 1, sm: 2 }}
                                        sx={{ flex: 1, pr: 6 }}
                                    >
                                        {/* Time */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AccessTimeIcon
                                                sx={{
                                                    fontSize: 20,
                                                    color: slot.isPast ? 'text.disabled' : 'primary.main'
                                                }}
                                            />
                                            <Typography
                                                fontWeight={600}
                                                color={slot.isPast ? 'text.disabled' : 'text.primary'}
                                                sx={{ minWidth: { xs: 'auto', sm: 140 } }}
                                            >
                                                {slot.startTime} - {slot.endTime}
                                            </Typography>
                                        </Box>

                                        {/* Status Badge */}
                                        <Chip
                                            size="small"
                                            icon={
                                                slot.isBooked ? <CheckCircleIcon /> :
                                                    slot.isPast ? <EventBusyIcon /> :
                                                        <EventAvailableIcon />
                                            }
                                            label={
                                                slot.isBooked ? 'Booked' :
                                                    slot.isPast ? 'Past' :
                                                        'Available'
                                            }
                                            color={
                                                slot.isBooked ? 'error' :
                                                    slot.isPast ? 'default' :
                                                        'success'
                                            }
                                            sx={{ minWidth: 95 }}
                                        />
                                    </Stack>
                                </ListItem>
                            ))
                        )}
                    </List>
                </>
            )}
        </Paper>
    );
}