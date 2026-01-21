'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, CircularProgress, Popover, Stack, Typography, IconButton, Divider, Button, useTheme, useMediaQuery } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';

import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg } from '@fullcalendar/core';

import { timeSlotService } from '@/src/services/timeSlotServices';
import { QUERY_KEYS } from '@/src/constants/queryKey';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import { ITimeSlot } from '@/src/models/timeSlot';

type TimeSlotWithStatus = ITimeSlot & { isPast: boolean };

// --- HELPER: UTC to Calendar Event ---
const transformSlotsToEvents = (slots: TimeSlotWithStatus[]) => {
    return slots.map((slot) => {
        // Default: Available (Green)
        let bgColor = '#2e7d32';
        let borderColor = '#1b5e20';
        let title = 'Available';

        // Logic: Past > Booked > Available
        if (slot.isPast) {
            bgColor = '#9e9e9e';      // Gray 500 (Disabled look)
            borderColor = '#757575';  // Gray 600
            title = slot.isBooked ? 'Booked (Past)' : 'Expired';
        } else if (slot.isBooked) {
            bgColor = '#d32f2f';      // Red (Booked)
            borderColor = '#c62828';
            title = 'Booked';
        }

        return {
            id: slot.id,
            title: title,
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
    onDateChange: (date: Date) => void; // Send date back to parent to update DatePicker
}

export default function TimeSlotCalendar({ currentDate, onDateChange }: TimeSlotCalendarProps) {
    const queryClient = useQueryClient();

    // State for Confirm Delete Dialog
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Track the visible range (Start/End date of the current view) state for change week
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // State for Popover (Edit, Delete)
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<ITimeSlot | null>(null);

    // --- RESPONSIVE SETUP ---
    const theme = useTheme();
    // 'md' is usually 900px. Below this, we switch to mobile view.
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Fetch Slots (By Range now, instead of single date)
    const { data: slots = [], isFetching } = useQuery({
        // Include range in queryKey so it refetches when you click "Next Week"
        queryKey: QUERY_KEYS.TIME_SLOTS.BY_RANGE(dateRange.start, dateRange.end),
        queryFn: () => timeSlotService.getSlotsByRange(dateRange.start, dateRange.end),
        // Only fetch if we have a valid range set
        enabled: !!dateRange.start,
        // set to keep old data
        //placeholderData: keepPreviousData, 
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
        setSelectedSlot(info.event.extendedProps as ITimeSlot);
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

    // change slots to events to display on calendar
    const calendarEvents = transformSlotsToEvents(slots);

    // popover open state
    const openPopover = Boolean(anchorEl);

    // Create a Ref to control FullCalendar API
    const calendarRef = useRef<FullCalendar>(null);
    // When 'currentDate' prop changes (from Sidebar), jump to it on Calendar
    useEffect(() => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.gotoDate(currentDate); // FORCE JUMP
        }
    }, [currentDate]);

    // Responsive: Detect if mobile to switch view
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

                                const midDate = new Date((dateInfo.start.getTime() + dateInfo.end.getTime()) / 2);
                                if (midDate.toDateString() !== currentDate.toDateString()) {
                                    onDateChange(midDate);
                                }
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
                transformOrigin={{ vertical: 'center', horizontal: 'left' }}
                slotProps={{
                    paper: {
                        sx: { width: 300, p: 2, borderRadius: 2 }
                    }
                }}
            >
                {selectedSlot && (
                    <Stack spacing={2}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" fontSize={16} fontWeight={600}>
                                {selectedSlot.isBooked ? 'Booked Slot' : 'Available Slot'}
                            </Typography>
                            <IconButton size="small" onClick={handleClosePopover}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                        <Divider />
                        <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                            <AccessTimeIcon fontSize="small" />
                            <Typography variant="body2">
                                {new Date(selectedSlot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {' - '}
                                {new Date(selectedSlot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                            Date: {selectedSlot.startTime.split("T").at(0)}
                        </Typography>
                        <Stack direction="row" spacing={1} justifyContent="flex-end" mt={1}>
                            <Button size="small" startIcon={<EditOutlinedIcon />} variant="outlined" onClick={() => alert("Edit feature coming soon!")}>
                                Edit
                            </Button>
                            <Button size="small" startIcon={<DeleteOutlineIcon />} variant="outlined" color="error" onClick={handleDeleteClick}>
                                Delete
                            </Button>
                        </Stack>
                    </Stack>
                )}
            </Popover>

            <ConfirmDeleteDialog
                open={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
                loading={deleteMutation.isPending}
            />
        </Box>
    );
}