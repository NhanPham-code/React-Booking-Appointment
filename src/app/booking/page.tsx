// src/app/booking/page.tsx
'use client';

import React, { useState } from 'react';
import { Container, Box, Grid, Paper, Typography } from '@mui/material';
import Navbar from '@/src/components/common/Navbar';
import PageHeader from '@/src/components/common/PageHeader';
import { withProtectedRoute } from '@/src/hoc/withProtectedRoute';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import TimeSlotCalendar from '@/src/components/timeslots/TimeSlotCalendar';
import CreateBookingDialog from '@/src/components/booking/CreateBookingDialog';
import { ITimeSlot } from '@/src/models/timeSlot';

function BookingPage() {
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<ITimeSlot | null>(null);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    // Handle when patient clicks "Book This Slot"
    const handleBookSlot = (slot: ITimeSlot) => {
        setSelectedSlot(slot);
        setIsBookingOpen(true);
    };

    const handleCloseBooking = () => {
        setIsBookingOpen(false);
        setSelectedSlot(null);
    };

    return (
        <>
            <Navbar />
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 4 }}>
                <Container maxWidth={false} sx={{ py: 1, px: { xs: 2, md: 4 } }}>

                    <Box sx={{ mb: 2 }}>
                        <PageHeader
                            title="Book Appointment"
                        />
                    </Box>

                    <Grid container spacing={2}>
                        {/* Left Sidebar:  Date Picker */}
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
                                        minDate={new Date()} // Can't book past dates
                                    />
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Right:  Time Slot Calendar (Booking Mode) */}
                        <Grid size={{ xs: 12, md: 8, lg: 9 }}>
                            <TimeSlotCalendar
                                currentDate={currentDate}
                                mode="booking" // Patient booking mode
                                onBookSlot={handleBookSlot} //  Callback
                            />
                        </Grid>
                    </Grid>
                </Container>

                {/* Booking Dialog */}
                <CreateBookingDialog
                    open={isBookingOpen} // state to control open/close
                    onClose={handleCloseBooking} // close handler
                    selectedSlot={selectedSlot} // pass selected slot to display in dialog
                />
            </Box>
        </>
    );
}

// Only patients can access booking page
export default withProtectedRoute(BookingPage, {
    allowedRoles: ['patient']
});