// src/components/timeslots/TimeSlotList. tsx
'use client';

import { List, ListItem, ListItemText, IconButton, Paper, Typography, Chip, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { timeSlotService } from '@/src/services/timeSlotServices';
import { ITimeSlot } from '@/src/models/timeSlot';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { QUERY_KEYS } from '@/src/constants/queryKey';

interface TimeSlotListProps {
    timeSlots: ITimeSlot[];
}

export default function TimeSlotList({ timeSlots }: TimeSlotListProps) {
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: timeSlotService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_SLOTS.ALL });
        }
    });

    if (timeSlots. length === 0) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <AccessTimeIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography color="text.secondary">
                    No time slots available.  Create one to get started!
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ maxHeight: 500, overflow: 'auto' }}>
            <List>
                {timeSlots.map((slot) => (
                    <ListItem
                        key={slot.id}
                        secondaryAction={
                            <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={() => deleteMutation. mutate(slot. id)}
                                disabled={slot.isBooked}
                            >
                                <DeleteIcon />
                            </IconButton>
                        }
                        divider
                        sx={{ 
                            opacity: slot.isBooked ?  0.6 : 1,
                            bgcolor: slot.isBooked ?  'action.hover' : 'transparent'
                        }}
                    >
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', alignItems:  'center', gap: 1 }}>
                                    <Typography component="span" fontWeight="bold">
                                        {slot.date}
                                    </Typography>
                                    <Chip
                                        label={`${slot.startTime} - ${slot.endTime}`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                    {slot.isBooked && (
                                        <Chip
                                            label="Booked"
                                            size="small"
                                            color="success"
                                        />
                                    )}
                                </Box>
                            }
                            secondary={slot.isBooked ? 'This slot has been booked' :  'Available for booking'}
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
}