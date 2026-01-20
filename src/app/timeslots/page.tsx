// src/app/timeslots/page.tsx
'use client';

import { Container, Grid, Box } from '@mui/material';
import Navbar from '@/src/components/common/Navbar';
import PageHeader from '@/src/components/common/PageHeader';
import TimeSlotForm from '@/src/components/timeslots/TimeSlotsForm';
import TimeSlotList from '@/src/components/timeslots/TimeSlotsList';

export default function TimeSlotsPage() {

    return (
        <>
            <Navbar />
            <Box sx={{
                minHeight: '100vh',
                bgcolor: 'background.default',
                py: { xs: 3, sm: 4 },
                px: { xs: 2, sm: 3 }
            }}>
                <Container maxWidth="lg">
                    <PageHeader
                        title="Manage Time Slots"
                        subtitle="Create and manage available appointment slots"
                    />

                    <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
                        {/* Form - Full width on mobile, left side on desktop */}
                        <Grid
                            size={{ xs: 12, md: 5 }}
                            sx={{ order: { xs: 1, md: 1 } }}
                        >
                            <TimeSlotForm />
                        </Grid>

                        {/* List - Below form on mobile, right side on desktop */}
                        <Grid
                            size={{ xs: 12, md: 7 }}
                            sx={{ order: { xs: 2, md: 2 } }}
                        >
                            <TimeSlotList />
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </>
    );
}