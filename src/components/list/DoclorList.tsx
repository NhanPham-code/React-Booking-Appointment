// src/components/list/DoctorList.tsx
'use client';

import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
    Box,
    Avatar,
    Chip
} from '@mui/material';
import { UserWithoutPassword } from '@/src/models/authentication';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

interface DoctorListProps {
    doctors: UserWithoutPassword[];
    onSelectDoctor: (doctorId: string, doctorName: string) => void;
}

export default function DoctorList({ doctors, onSelectDoctor }: DoctorListProps) {
    if (doctors.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                    No doctors available at the moment
                </Typography>
            </Box>
        );
    }

    return (
        <Grid container spacing={3}>
            {doctors.map((doctor) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={doctor.id}>
                    <Card
                        sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-8px)',
                                boxShadow: 6,
                            },
                        }}
                    >
                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Avatar and Name */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                                <Avatar
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        bgcolor: 'primary.main',
                                        fontSize: '2rem',
                                    }}
                                >
                                    {doctor.fullname?.charAt(0).toUpperCase()}
                                </Avatar>
                                <Typography variant="h6" component="h3" fontWeight="bold" textAlign="center">
                                    {doctor.fullname}
                                </Typography>
                                <Chip
                                    label="Doctor"
                                    color="primary"
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                />
                            </Box>

                            {/* Details */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                                {doctor.email && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <EmailIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {doctor.email}
                                        </Typography>
                                    </Box>
                                )}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                        ID: {doctor.id}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Book Button */}
                            <Button
                                variant="contained"
                                fullWidth
                                startIcon={<CalendarMonthIcon />}
                                onClick={() => onSelectDoctor(doctor.id.toString(), doctor.fullname!)}
                                sx={{
                                    mt: 'auto',
                                    py: 1.2,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                }}
                            >
                                Book Appointment
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}
