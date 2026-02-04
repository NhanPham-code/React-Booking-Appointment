// src/app/timeslots/page.tsx
'use client';

import React, { useState } from 'react';
import { Container, Box, Fab, Tooltip, Grid, Paper, Typography } from '@mui/material';
import Navbar from '@/src/components/common/Navbar';
import PageHeader from '@/src/components/common/PageHeader';
import { withProtectedRoute } from '@/src/hoc/withProtectedRoute';
import AddIcon from '@mui/icons-material/Add';
import dayjs from 'dayjs';

// Import React Date Picker & Styles
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// Components
import TimeSlotCalendar from '@/src/components/calendar/timeslots/TimeSlotCalendar';
import CreateSlotDialog from '@/src/components/dialog/timeslots/CreateSlotDialog';

import { useAuth } from '@/src/context/AuthContext';

/**
 * TimeSlotsPage component for managing and viewing time slots.
 * @returns JSX.Element
 */
function TimeSlotsPage() {
    // Lift Date State Up
    const [currentDate, setCurrentDate] = useState<Date>(new Date());

    // Modal States
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // get doctor id
    const doctorId = useAuth().user?.id;

    return (
        <>
            <Navbar />
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 4 }}>
                <Container maxWidth={false} sx={{ py: 1, px: { xs: 2, md: 4 } }}>

                    <Box sx={{ mb: 2 }}>
                        <PageHeader
                            title="Schedule Management"
                        />
                    </Box>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                            <Paper elevation={2} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'white' }}>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5, px: 1 }}>
                                    Jump to Date
                                </Typography>

                                <Box sx={{
                                    '& .react-datepicker': {
                                        border: 'none',
                                        fontFamily: 'inherit',
                                        width: '100%',
                                    },
                                    '& .react-datepicker__month-container': { width: '100%' },
                                    '& .react-datepicker__header': {
                                        bgcolor: 'plum',
                                        borderBottom: 'none',
                                        pt: 1
                                    },
                                    '& .react-datepicker__current-month': {
                                        color: 'text.primary',
                                        fontWeight: 700,
                                        fontSize: '1rem',
                                        mb: 1
                                    },
                                    '& .react-datepicker__day-name': { color: 'text.secondary' },
                                    '& .react-datepicker__day': {
                                        borderRadius: '8px',
                                        fontWeight: 500,
                                        '&:hover': { bgcolor: 'primary.light', color: 'primary.contrastText' }
                                    },
                                    '& .react-datepicker__day--selected': {
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                        fontWeight: 700
                                    },
                                    '& .react-datepicker__day--keyboard-selected': {
                                        backgroundColor: 'primary.light',
                                        color: 'white'
                                    },
                                    '& .react-datepicker__day--today': {
                                        border: '1px solid',
                                        borderColor: 'primary.main',
                                        color: 'primary.main',
                                        fontWeight: 'bold',
                                        backgroundColor: 'transparent'
                                    },
                                    display: 'flex',
                                    justifyContent: 'center'
                                }}>
                                    <DatePicker
                                        selected={currentDate}
                                        onChange={(date: Date | null) => {
                                            if (date) setCurrentDate(date);
                                        }}
                                        inline
                                    />
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid size={{ xs: 12, md: 8, lg: 9 }}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200', minHeight: '400px' }}>
                                <TimeSlotCalendar
                                    currentDate={currentDate}
                                    mode="manage"
                                    userId={doctorId}
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>

                {/* Floating Action Button for Create */}
                <Tooltip title="Add Time Slot" placement="left">
                    <Fab
                        color="primary"
                        aria-label="add"
                        sx={{ position: 'fixed', bottom: 24, right: 24 }}
                        onClick={() => setIsCreateOpen(true)}
                    >
                        <AddIcon />
                    </Fab>
                </Tooltip>

                {/* Create Popup Form */}
                <CreateSlotDialog
                    open={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    initialDate={dayjs(currentDate).format('YYYY-MM-DD')}
                    doctorId={doctorId}
                />
            </Box>
        </>
    );
}

// protect route only doctor access
export default withProtectedRoute(TimeSlotsPage, { allowedRoles: ['doctor'] });