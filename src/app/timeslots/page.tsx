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
import TimeSlotCalendar from '@/src/components/timeslots/TimeSlotCalendar';
import CreateSlotDialog from '@/src/components/timeslots/CreateSlotDialog';

function TimeSlotsPage() {
    // Lift Date State Up
    const [currentDate, setCurrentDate] = useState<Date>(new Date());

    // Modal States
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    return (
        <>
            <Navbar />
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 4 }}>
                <Container maxWidth={false} sx={{ py: 1, px: { xs: 2, md: 4 }}}>

                    <Box sx={{ mb: 2 }}>
                        <PageHeader
                            title="Schedule Management"
                            subtitle="View and manage your appointments"
                        />
                    </Box>

                    <Grid container spacing={2}>
                        
                        {/* --- LEFT SIDEBAR: REACT DATE PICKER --- */}
                        <Grid  size={{ xs: 12, md: 3 ,lg: 2.5 }}>
                            <Paper elevation={2} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'white' }}>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5, px: 1 }}>
                                    Jump to Date
                                </Typography>
                                
                                {/* We wrap it in a Box to override styles slightly 
                                    to make it fit the MUI theme better 
                                */}
                                <Box sx={{ 
                                    '& .react-datepicker': {
                                        border: 'none',
                                        fontFamily: 'inherit',
                                        width: '100%',
                                        display: 'block'
                                    },
                                    '& .react-datepicker__month-container': {
                                        width: '100%',
                                        float: 'none'
                                    },
                                    '& .react-datepicker__day-name, & .react-datepicker__day': {
                                        width: '2rem',
                                        lineHeight: '2rem',
                                        margin: '0.1rem'
                                    },
                                    '& .react-datepicker__header': {
                                        bgcolor: 'primary.light',
                                        borderBottom: 'none',
                                        opacity: 0.9,
                                        pt: 1
                                    },
                                    '& .react-datepicker__current-month': {
                                        color: 'white',
                                        fontSize: '0.9rem',
                                        marginBottom: '5px'
                                    },
                                    '& .react-datepicker__day--selected': {
                                        backgroundColor: 'primary.main',
                                        borderRadius: '50%'
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

                        {/* --- RIGHT CONTENT (Main Calendar) --- */}
                        <Grid size={{ xs: 12, md: 9 ,lg: 9.5 }}>
                            <TimeSlotCalendar 
                                currentDate={currentDate}
                                onDateChange={setCurrentDate}
                            />
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
                />
            </Box>
        </>
    );
}

// protect route only doctor access
export default withProtectedRoute(TimeSlotsPage, { allowedRoles: ['doctor'] });