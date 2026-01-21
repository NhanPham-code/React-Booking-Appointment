// src/hoc/withProtectedRoute.tsx
'use client';

import { useAuth } from '@/src/context/AuthContext';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { UserRole } from '@/src/models/authentication';
import { useRouter } from 'next/navigation';

// PROTECT ROUTE PAGE (Authen, Role)
interface ProtectedRouteOptions {
    allowedRoles?: UserRole[];
}

export function withProtectedRoute<P extends object>(
    Component: React.ComponentType<P>,
    options: ProtectedRouteOptions = {}
) {
    return function ProtectedRoute(props: P) {
        const { user, isLoading, isAuthenticated } = useAuth(); // get data from AuthContext
        const router = useRouter();
        const { allowedRoles } = options;

        // CASE 1: Đang loading
        if (isLoading) {
            console.log('⏳ [withProtectedRoute] Loading...');
            return (
                <Box sx={{ 
                    display: 'flex', 
                    minHeight: '100vh', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 2
                }}>
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary">
                        Checking authentication...
                    </Typography>
                </Box>
            );
        }

        // CASE 2: Chưa đăng nhập
        if (!isAuthenticated || !user) {
            console.log('🚫 [withProtectedRoute] Not authenticated, should redirect to /login');
            return (
                <Box sx={{ 
                    display: 'flex', 
                    minHeight: '100vh', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 2,
                    p: 3
                }}>
                    <CircularProgress />
                    <Typography variant="h6">Redirecting to login...</Typography>
                    <Typography variant="body2" color="text.secondary">
                        You need to login first
                    </Typography>
                    <Button 
                        variant="contained" 
                        onClick={() => router.push('/login')}
                    >
                        Go to Login
                    </Button>
                </Box>
            );
        }

        // CASE 3: Check role
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            console.log('⛔ [withProtectedRoute] Access denied. User role:', user.role, 'Required:', allowedRoles);
            return (
                <Box sx={{ 
                    display: 'flex', 
                    minHeight: '100vh', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 2,
                    p: 3,
                    textAlign: 'center'
                }}>
                    <Typography variant="h3">🚫</Typography>
                    <Typography variant="h5" fontWeight={600}>
                        Access Denied
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Your role ({user.role}) is not allowed to access this page.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Required roles: {allowedRoles.join(', ')}
                    </Typography>
                    <Button 
                        variant="contained" 
                        onClick={() => router.push('/')}
                        sx={{ mt: 2 }}
                    >
                        Go to Home
                    </Button>
                </Box>
            );
        }

        // CASE 4: OK - Render component
        console.log('✅ [withProtectedRoute] Access granted');
        return <Component {...props} />;
    };
}