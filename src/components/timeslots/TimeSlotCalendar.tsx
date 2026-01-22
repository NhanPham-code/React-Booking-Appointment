'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, CircularProgress, Popover, Stack, Typography, IconButton, Divider, Button, useTheme, useMediaQuery, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LockIcon from '@mui/icons-material/Lock';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg } from '@fullcalendar/core';

import { timeSlotService } from '@/src/services/timeSlotServices';
import { QUERY_KEYS } from '@/src/constants/queryKey';
import ConfirmDeleteDialog from '../common/ConfirmDeleteDialog';
import { ITimeSlot } from '@/src/models/timeSlot';

// Extend ITimeSlot to include isPast property
type TimeSlotWithStatus = ITimeSlot & { isPast: boolean };

/**
 * Transform TimeSlotWithStatus array to FullCalendar event objects.
 * @param slots Array of time slots with status.
 * @returns Array of FullCalendar event objects.
 */
const transformSlotsToEvents = (slots: TimeSlotWithStatus[]) => {
    return slots.map((slot) => {
        // Default: Available (Green)
        let bgColor = '#2e7d32';
        let borderColor = '#1b5e20';

        // Logic: Past > Booked > Available
        if (slot.isPast) {
            bgColor = '#9e9e9e';      // Gray 500 (Disabled look)
            borderColor = '#757575';  // Gray 600
        } else if (slot.isBooked) {
            bgColor = '#d32f2f';      // Red (Booked)
            borderColor = '#c62828';
        }

        return {
            id: slot.id,
            title: slot.isBooked ? '🔒 Booked' : slot.isPast ? '⏰ Past' : '✅ Available',
            start: slot.startTime,
            end: slot.endTime,
            backgroundColor: bgColor,
            borderColor: borderColor,
            // Ensure isPast is passed to extendedProps so we can check it in the Popover
            extendedProps: { ...slot }
        };
    });
};


interface TimeSlotCalendarProps {
    currentDate: Date; // Receive the shared date from DatePicker
    mode?:  'manage' | 'booking'; // mode of the calendar (manage: doctor, booking: patient)
    onBookSlot?: (slot: ITimeSlot) => void; // Callback when patient clicks "Book"
}

/**
 * Calendar component to display and manage time slots.
 * @param props Component props.
 * @returns JSX.Element
 */
export default function TimeSlotCalendar({ currentDate, mode = 'manage', onBookSlot }: TimeSlotCalendarProps) {
    const queryClient = useQueryClient();

    // State for Confirm Delete Dialog
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Track the visible range (Start/End date of the current view) state for change week
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // State for Popover (Edit, Delete)
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlotWithStatus | null>(null);

    // --- RESPONSIVE SETUP ---
    const theme = useTheme();
    // 'md' is usually 900px. Below this, we switch to mobile view.
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Fetch Slots
    const { data: slots = [], isFetching } = useQuery({
        // Include range in queryKey so it re-fetches when you click "Next Week"
        queryKey: QUERY_KEYS.TIME_SLOTS.BY_RANGE(dateRange.start, dateRange.end),
        queryFn: () => timeSlotService.getSlotsByRange(dateRange.start, dateRange.end),
        // Only fetch if we have a valid range set
        enabled: !!dateRange.start,
    });

    // Delete Logic
    const deleteMutation = useMutation({
        mutationFn: timeSlotService.delete,
        onSuccess: () => {
            // Invalidate the specific range query
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_SLOTS.ALL });
            setDeleteId(null);
        }
    });

    // Handle Event Click
    const handleEventClick = (info: EventClickArg) => {
        // Prevent default browser navigation if any
        info.jsEvent.preventDefault();

        // Save the element clicked (to position the popover)
        setAnchorEl(info.el);

        // Save the data of the clicked slot
        setSelectedSlot(info.event.extendedProps as TimeSlotWithStatus);
    };

    // Handle Close Popover
    const handleClosePopover = () => {
        setAnchorEl(null);
        setSelectedSlot(null);
    };

    // Handle "Delete" click inside Popover
    const handleDeleteClick = () => {
        if (selectedSlot) {
            if (selectedSlot.isBooked) {
                alert("Cannot delete a booked slot!");
                return;
            }
            // Close popover
            handleClosePopover();
            // Open confirm dialog
            setDeleteId(selectedSlot.id);
        }
    };

    // Handle Book Click (for patient)
    const handleBookClick = () => {
        if (selectedSlot && onBookSlot) {
            handleClosePopover();
            onBookSlot(selectedSlot); // Call the callback to parent component to handle booking
        }
    };

    // change slots to events to display on calendar
    const calendarEvents = transformSlotsToEvents(slots);

    // popover open state
    const openPopover = Boolean(anchorEl);

    // Create a Ref to control FullCalendar instance in this component
    // To allow jumping to dates when 'currentDate' changes
    const calendarRef = useRef<FullCalendar>(null);
    // When 'currentDate' prop changes (from Sidebar), jump to it on Calendar
    useEffect(() => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.gotoDate(currentDate); // FORCE JUMP
        }
    }, [currentDate]); // when currentDate prop changes from parent

    // Responsive: Detect if mobile to switch view (calendarRef dependency to re-render on resize)
    useEffect(() => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            const newView = 'timeGridWeek';
            if (calendarApi.view.type !== newView) {
                calendarApi.changeView(newView);
            }
        }
    }, [isMobile]); // trigger render calendar on isMobile change (resize)

    return (
        <Box sx={{ height: { xs: 'calc(100vh - 150px)', md: '800px' }, p: { xs: 1, md: 2 } }}>
            <Paper elevation={3} sx={{ p: { xs: 1, md: 2 }, height: '100%', borderRadius: 2, position: 'relative', display: 'flex', flexDirection: 'column' }}>

                {isFetching && (
                    <Box sx={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        bgcolor: 'rgba(255, 255, 255, 0.5)',
                        zIndex: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <CircularProgress />
                    </Box>
                )}

                {/* --- Display Mode --- */}
                <Box sx={{ mb: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip 
                        size="small"
                        label={mode === 'manage' ? '🩺 Manage Mode' : '📅 Booking Mode'}
                        color={mode === 'manage' ?  'primary' : 'secondary'}
                    />
                    <Stack direction="row" spacing={1}>
                        <Chip size="small" label="Available" sx={{ bgcolor: '#4caf50', color: 'white' }} />
                        <Chip size="small" label="Booked" sx={{ bgcolor: '#f44336', color: 'white' }} />
                        <Chip size="small" label="Past" sx={{ bgcolor: '#9e9e9e', color: 'white' }} />
                    </Stack>
                </Box>

                {/* --- SCROLLABLE CONTAINER --- */}
                {/* 'auto' enables horizontal scrolling */}
                <Box sx={{ flexGrow: 1, overflowX: 'auto', overflowY: 'hidden' }}>
                    
                    {/* minWidth: '800px' ensures columns don't shrink too small on mobile. 
                           If screen is < 800px, scrollbar appears. */}
                    <Box sx={{ minWidth: '800px', height: '100%' }}>
                        
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                            
                            initialView="timeGridWeek"
                            timeZone="local"

                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay'
                            }}

                            events={calendarEvents}
                            eventClick={handleEventClick}
                            height="100%"
                            allDaySlot={false}
                            slotMinTime="00:00:00"
                            slotMaxTime="24:00:00"
                            eventMinHeight={30} 
                            
                            datesSet={(dateInfo) => {
                                const start = dateInfo.startStr;
                                const end = dateInfo.endStr;
                                setDateRange({ start, end });
                            }}
                        />
                    </Box>
                </Box>
            </Paper>

            <Popover
                open={openPopover}
                anchorEl={anchorEl}
                onClose={handleClosePopover}
                anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
                transformOrigin={{ vertical:  'center', horizontal: 'left' }}
                slotProps={{ paper: { sx: { width: 320, p: 2, borderRadius: 2 } } }}
            >
                {selectedSlot && (
                    <Stack spacing={2}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" fontSize={16} fontWeight={600}>
                                {selectedSlot.isBooked ? '🔒 Booked Slot' : selectedSlot.isPast ? '⏰ Past Slot' : '✅ Available Slot'}
                            </Typography>
                            <IconButton size="small" onClick={handleClosePopover}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                        
                        <Divider />
                        
                        <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                            <AccessTimeIcon fontSize="small" />
                            <Typography variant="body2">
                                {new Date(selectedSlot.startTime).toLocaleTimeString([], { hour: '2-digit', minute:  '2-digit' })}
                                {' - '}
                                {new Date(selectedSlot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                        </Stack>
                        
                        <Typography variant="caption" color="text.secondary">
                            📅 {new Date(selectedSlot.startTime).toLocaleDateString()}
                        </Typography>

                        {/* CONDITIONAL ACTIONS */}
                        {mode === 'manage' ?  (
                            // DOCTOR:  Edit & Delete
                            <Stack direction="row" spacing={1} justifyContent="flex-end" mt={1}>
                                <Button 
                                    size="small" 
                                    startIcon={<EditOutlinedIcon />} 
                                    variant="outlined"
                                    disabled={selectedSlot.isBooked || selectedSlot.isPast}
                                >
                                    Edit
                                </Button>
                                <Button 
                                    size="small" 
                                    startIcon={<DeleteOutlineIcon />} 
                                    variant="outlined" 
                                    color="error" 
                                    onClick={handleDeleteClick}
                                    disabled={selectedSlot.isBooked} // Can't delete booked slots
                                >
                                    Delete
                                </Button>
                            </Stack>
                        ) : (
                            // PATIENT: Book This Slot
                            <Box>
                                {selectedSlot.isBooked ? (
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 1, bgcolor: 'error.50', borderRadius: 1 }}>
                                        <LockIcon color="error" fontSize="small" />
                                        <Typography variant="body2" color="error. main">
                                            This slot is already booked
                                        </Typography>
                                    </Stack>
                                ) : selectedSlot.isPast ? (
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                                        <AccessTimeIcon color="disabled" fontSize="small" />
                                        <Typography variant="body2" color="text.secondary">
                                            This slot is in the past
                                        </Typography>
                                    </Stack>
                                ) : (
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        startIcon={<EventAvailableIcon />}
                                        onClick={handleBookClick}
                                        sx={{ mt: 1 }}
                                    >
                                        Book This Slot
                                    </Button>
                                )}
                            </Box>
                        )}
                    </Stack>
                )}
            </Popover>

            <ConfirmDeleteDialog
                open={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} // call delete mutation
                loading={deleteMutation.isPending}
                title="Delete Time Slot"
                message="Are you sure you want to delete this time slot? This action cannot be undone."
            />
        </Box>
    );
}