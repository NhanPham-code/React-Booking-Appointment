// src/app/login/page.tsx
'use client';

import React from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Stack,
    Alert,
    Container,
    Divider,
    Chip,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '@/src/validations/loginSchema';
import { LoginFormData } from '@/src/validations/loginSchema';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '@/src/context/AuthContext'; // Import useAuth from AuthContext

export default function LoginPage() {
    const { login } = useAuth();
    const [error, setError] = React.useState<string | null>(null);

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
        resolver: yupResolver(loginSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });

    // ===== SUBMIT HANDLER =====
    const onSubmit = async (data: LoginFormData) => {
        setError(null);
        
        try {
            // GỌI QUA CONTEXT (để Context tự cập nhật state)
            await login(data);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
            }}
        >
            <Container maxWidth="sm">
                <Card sx={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                    <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                        {/* ===== HEADER ===== */}
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    p: 2,
                                    borderRadius: '50%',
                                    bgcolor: 'primary.50',
                                    mb: 2,
                                }}
                            >
                                <LockIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                            </Box>
                            <Typography variant="h4" fontWeight={700} gutterBottom>
                                Welcome Back
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Sign in to continue to BookingApp
                            </Typography>
                        </Box>

                        {/* ===== ERROR MESSAGE ===== */}
                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        {/* ===== LOGIN FORM ===== */}
                        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                            <Stack spacing={3}>
                                <Controller
                                    name="username"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Username"
                                            placeholder="Enter your username"
                                            error={!!errors.username}
                                            helperText={errors.username?.message}
                                            fullWidth
                                            InputProps={{
                                                startAdornment: (
                                                    <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                                ),
                                            }}
                                        />
                                    )}
                                />

                                <Controller
                                    name="password"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="password"
                                            label="Password"
                                            placeholder="Enter your password"
                                            error={!!errors.password}
                                            helperText={errors.password?.message}
                                            fullWidth
                                            InputProps={{
                                                startAdornment: (
                                                    <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                                ),
                                            }}
                                        />
                                    )}
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    disabled={isSubmitting}
                                    sx={{ py: 1.5 }}
                                >
                                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                                </Button>
                            </Stack>
                        </Box>

                        <Divider sx={{ my: 3 }}>
                            <Typography variant="caption" color="text.secondary">
                                Demo Accounts
                            </Typography>
                        </Divider>

                        {/* ===== DEMO CREDENTIALS ===== */}
                        <Stack spacing={2}>
                            <Box>
                                <Typography 
                                    variant="caption" 
                                    fontWeight={600} 
                                    color="primary.main" 
                                    display="block" 
                                    gutterBottom
                                >
                                    🩺 Doctor Account:
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <Chip label="doctor" size="small" variant="outlined" />
                                    <Chip label="doctor123" size="small" variant="outlined" />
                                </Stack>
                            </Box>
                            <Box>
                                <Typography 
                                    variant="caption" 
                                    fontWeight={600} 
                                    color="secondary.main" 
                                    display="block" 
                                    gutterBottom
                                >
                                    👤 Patient Account:
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <Chip label="patient" size="small" variant="outlined" />
                                    <Chip label="patient123" size="small" variant="outlined" />
                                </Stack>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
}