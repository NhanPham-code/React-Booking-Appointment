// src/app/booking/page.tsx
'use client';

import React, { useState } from 'react';
import {
    Container, Box, Grid, Paper, Typography, Button,
    Avatar, Chip, Stack, Divider, Rating
} from '@mui/material';
import Navbar from '@/src/components/common/Navbar';
import PageHeader from '@/src/components/common/PageHeader';
import { withProtectedRoute } from '@/src/hoc/withProtectedRoute';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import TimeSlotCalendar from '@/src/components/calendar/timeslots/TimeSlotCalendar';
import CreateBookingDialog from '@/src/components/dialog/booking/CreateBookingDialog';
import { ITimeSlot } from '@/src/models/timeSlot';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedIcon from '@mui/icons-material/Verified';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

function BookingPage() {
    const searchParams = useSearchParams();
    const doctorId = searchParams.get('doctorId');
    const doctorName = searchParams.get('doctorName');

    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<ITimeSlot | null>(null);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    const handleBookSlot = (slot: ITimeSlot) => {
        setSelectedSlot(slot);
        setIsBookingOpen(true);
    };

    const handleCloseBooking = () => {
        setIsBookingOpen(false);
        setSelectedSlot(null);
    };

    const router = useRouter();

    // Hàm lấy chữ cái đầu để làm Avatar nếu không có ảnh
    const getInitials = (name: string) => {
        return name ? name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'DR';
    };

    return (
        <>
            <Navbar />
            <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8', pb: 4 }}>
                <Container maxWidth={false} sx={{ py: 3, px: { xs: 2, md: 8 } }}>
                    <PageHeader
                        title="Book an Appointment"
                    />

                    {/* Back Button - Đặt gọn gàng ở trên cùng */}
                    <Box sx={{ mb: 3 }}>
                        <Button
                            variant="text"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => router.back()}
                            sx={{
                                color: 'text.secondary',
                                textTransform: 'none',
                                '&:hover': { bgcolor: 'transparent', color: 'primary.main', textDecoration: 'underline' }
                            }}
                        >
                            Back to Doctors List
                        </Button>
                    </Box>

                    {doctorName && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                mb: 4,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)',
                                border: '1px solid',
                                borderColor: 'grey.200',
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: 'center',
                                gap: 3,
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <Box sx={{
                                position: 'absolute', top: -20, right: -20, width: 100, height: 100,
                                bgcolor: 'primary.main', opacity: 0.05, borderRadius: '50%'
                            }} />

                            <Avatar
                                sx={{
                                    width: 80,
                                    height: 80,
                                    bgcolor: 'primary.main',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                            >
                                {getInitials(doctorName)}
                            </Avatar>

                            <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                                    <Typography variant="h5" fontWeight="700" color="text.primary">
                                        Dr. {doctorName}
                                    </Typography>
                                    <VerifiedIcon color="primary" sx={{ fontSize: 20 }} />
                                </Stack>

                                <Stack direction="row" alignItems="center" spacing={1} justifyContent={{ xs: 'center', sm: 'flex-start' }} sx={{ mb: 1.5 }}>
                                    <MedicalServicesIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                        Specialist
                                    </Typography>
                                    <Divider orientation="vertical" flexItem sx={{ height: 16, alignSelf: 'center' }} />
                                    <Rating value={5} readOnly size="small" sx={{ fontSize: 16 }} />
                                    <Typography variant="caption" color="text.secondary">(Top Rated)</Typography>
                                </Stack>

                                <Chip
                                    label="Available for Booking"
                                    color="success"
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontWeight: 600, bgcolor: 'success.light', color: 'success.dark', border: 'none' }}
                                />
                            </Box>

                            <Box sx={{ borderLeft: { sm: '1px solid' }, borderColor: 'grey.300', pl: { sm: 3 }, textAlign: { xs: 'center', sm: 'left' } }}>
                                <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 0.5 }}>
                                    Consultation Fee
                                </Typography>
                                <Typography variant="h6" color="primary.main" fontWeight="bold">
                                    $50.00 <Typography component="span" variant="caption" color="text.secondary">/ session</Typography>
                                </Typography>
                            </Box>
                        </Paper>
                    )}

                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    📅 Select Date
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
                                        minDate={new Date()}
                                    />
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid size={{ xs: 12, md: 8, lg: 9 }}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200', minHeight: '400px' }}>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                                    🕒 Available Slots
                                </Typography>
                                <TimeSlotCalendar
                                    currentDate={currentDate}
                                    mode="booking"
                                    userId={doctorId ? parseInt(doctorId) : undefined}
                                    onBookSlot={handleBookSlot}
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>

                <CreateBookingDialog
                    open={isBookingOpen}
                    onClose={handleCloseBooking}
                    selectedSlot={selectedSlot}
                />
            </Box >
        </>
    );
}

export default withProtectedRoute(BookingPage, {
    allowedRoles: ['patient']
});