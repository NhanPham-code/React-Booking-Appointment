// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/src/services/authService';
import { IUser } from '@/src/models/authentication';
import { LoginFormData } from '../validations/loginSchema';
import { CircularProgress, Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

interface AuthContextType {
    user: IUser | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginFormData) => Promise<void>;
    logout: () => void;
}

// Use context to provide auth state and functions
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component to wrap the app and provide auth context
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<IUser | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const queryClient = useQueryClient();

    // check login session
    useEffect(() => {
        const initAuth = async () => {
            const storedUser = authService.getUserFromSession();
            const storedToken = authService.getAccessTokenFromSession();
            if (storedUser) {
                setUser(storedUser);
            }
            if (storedToken) {
                setAccessToken(storedToken);
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    // Check login function and update state
    const login = async (credentials: LoginFormData) => {
        try {
            const user = await authService.login(credentials);

            if (!user) {
                throw new Error("No user data returned");
            }

            setUser(user);
            setAccessToken(authService.getAccessTokenFromSession());
            router.push('/');
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status === 401) {
                throw new Error('Invalid username or password');
            }
            else {
                throw new Error('Login failed');
            }
        }
    };

    const logout = async () => {
        await authService.logout();
        queryClient.clear(); // Clear react-query cache
        setUser(null); // Reset state to null
        setAccessToken(null);
        router.push('/');
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    // PROVIDE DATA TO THE ENTIRE APP
    return (
        <AuthContext.Provider value={{
            user,
            accessToken,
            isAuthenticated: user !== null && user !== undefined,
            isLoading,
            login,  // Export login function
            logout  // Export logout function
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// Export custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};