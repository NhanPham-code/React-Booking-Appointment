// src/app/timeslots/page.tsx
'use client';

import { Container, Grid, CircularProgress, Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/src/components/common/Navbar';
import PageHeader from '@/src/components/common/PageHeader';
import TimeSlotForm from '@/src/components/timeslots/TimeSlotsForm';
import TimeSlotList from '@/src/components/timeslots/TimeSlotsList';
import { timeSlotService } from '@/src/services/timeSlotServices';
import { QUERY_KEYS } from '@/src/constants/queryKey';

export default function TimeSlotsPage() {
    // lấy danh sách TimeSlots
    const { data: timeSlots = [], isLoading } = useQuery({
        queryKey: QUERY_KEYS.TIME_SLOTS.ALL,
        queryFn:  timeSlotService. getAll,
    });

    return (
        <>
            <Navbar />
            <Box sx={{ minHeight: '100vh', bgcolor:  'background.default', py: 4 }}>
                <Container maxWidth="lg">
                    <PageHeader
                        title="Manage Time Slots"
                        subtitle="Create and manage available appointment slots"
                    />

                    {isLoading ? (
                        <Box display="flex" justifyContent="center" py={8}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Grid container spacing={4}>
                            <Grid size={{ xs: 12, md: 5 }}>
                                <TimeSlotForm />
                            </Grid>
                            <Grid size={{ xs: 12, md: 7 }}>
                                <Typography variant="h6" gutterBottom>
                                    All Time Slots
                                </Typography>
                                <TimeSlotList timeSlots={timeSlots} />
                            </Grid>
                        </Grid>
                    )}
                </Container>
            </Box>
        </>
    );
}