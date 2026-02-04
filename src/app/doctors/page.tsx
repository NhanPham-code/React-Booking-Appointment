// src/app/doctors/page.tsx
'use client';

import React from 'react';
import { Container, Box, CircularProgress, Typography } from '@mui/material';
import Navbar from '@/src/components/common/Navbar';
import PageHeader from '@/src/components/common/PageHeader';
import { withProtectedRoute } from '@/src/hoc/withProtectedRoute';
import DoctorList from '@/src/components/list/DoclorList';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getDoctors } from '@/src/services/userServices';
import { QUERY_KEYS } from '@/src/constants/queryKey';

function DoctorsPage() {
    const router = useRouter();

    // Fetch doctors using React Query
    const { data: doctors, isLoading, error } = useQuery({
        queryKey: QUERY_KEYS.USERS.DOCTORS,
        queryFn: getDoctors,
    });

    // Handle doctor selection
    const handleSelectDoctor = (doctorId: string, doctorName: string) => {
        router.push(`/booking?doctorId=${doctorId}&doctorName=${encodeURIComponent(doctorName)}`);
    };

    return (
        <>
            <Navbar />
            <Box
                sx={{
                    minHeight: '100vh',
                    bgcolor: 'background.default',
                    pb: 4,
                }}
            >
                <Container maxWidth="lg" sx={{ py: 3, px: { xs: 2, md: 4 } }}>
                    <Box sx={{ mb: 4 }}>
                        <PageHeader
                            title="Select a Doctor"
                        />
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ mt: 1, textAlign: 'center' }}
                        >
                            Choose a doctor to view their available time slots and book an appointment
                        </Typography>
                    </Box>

                    {isLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress />
                        </Box>
                    )}

                    {error && (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="h6" color="error">
                                Error loading doctors. Please try again later.
                            </Typography>
                        </Box>
                    )}

                    {!isLoading && !error && doctors && (
                        <DoctorList
                            doctors={doctors}
                            onSelectDoctor={handleSelectDoctor}
                        />
                    )}
                </Container>
            </Box>
        </>
    );
}

// Only patients can access doctors selection page
export default withProtectedRoute(DoctorsPage, {
    allowedRoles: ['patient'],
});
