// src/hoc/withProtectedRoute.tsx
'use client';

import { useAuth } from '@/src/context/AuthContext';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { UserRole } from '@/src/models/authentication';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// PROTECT ROUTE PAGE (Authen, Role)
interface ProtectedRouteOptions {
    allowedRoles?: UserRole[];
}

/**
 * Higher-order component to protect routes based on authentication and user roles.
 * @param Component The component to be protected.
 * @param options Options to specify allowed user roles.
 * @returns A component that enforces authentication and role-based access control.
 */
export function withProtectedRoute<P extends object>(
    Component: React.ComponentType<P>,
    options: ProtectedRouteOptions = {}
) {
    return function ProtectedRoute(props: P) {
        const { user, isLoading, isAuthenticated } = useAuth(); // get data from AuthContext
        const router = useRouter();
        const { allowedRoles } = options;

        // check authentication and authorization
        useEffect(() => {
            if (!isAuthenticated) {
                console.log('🚫 [withProtectedRoute] Not authenticated, redirecting to /login');
                router.push('/login');
            }
        }, [isAuthenticated, router]);
        

        // loading
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

        // check role authorization
        if (user && allowedRoles && !allowedRoles.includes(user.role)) {
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

        // authorized
        console.log('✅ [withProtectedRoute] Access granted');
        return <Component {...props} />;
    };
}