// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/src/services/authService';
import { UserWithoutPassword } from '@/src/models/authentication';
import { LoginFormData } from '../validations/loginSchema';
import { CircularProgress, Box } from '@mui/material';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: UserWithoutPassword | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginFormData) => Promise<void>;
    logout: () => void;
}

// Use context to provide auth state and functions
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component to wrap the app and provide auth context
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserWithoutPassword | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // check login session
    useEffect(() => {
        const initAuth = async () => {
            const storedUser = authService.getSession();
            if (storedUser) {
                setUser(storedUser);
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    // Check login function and update state
    const login = async (credentials: LoginFormData) => {
        // get user data
        const user = await authService.login(credentials);
        
        if (user) {
            // update state to trigger update UI
            setUser(user);
            router.push('/');
            return; 
        } else {
            throw new Error('Login failed');
        }
    };

    const logout = async () => {
        await authService.logout();
        setUser(null); // Reset state to null
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
            isAuthenticated: !!user, 
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