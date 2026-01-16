// src/components/home/FeatureCard.tsx
'use client';

import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface FeatureCardProps {
    title: string;
    description: string;
    icon: ReactNode;
    buttonText: string;
    href: string;
    gradient:  string;
}

export default function FeatureCard({ title, description, icon, buttonText, href, gradient }: FeatureCardProps) {
    const router = useRouter();

    return (
        <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
            }
        }}>
            <Box sx={{ 
                p: 3, 
                background: gradient,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Box sx={{ 
                    bgcolor: 'white', 
                    borderRadius: '50%', 
                    p: 2,
                    display: 'flex',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}>
                    {icon}
                </Box>
            </Box>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="body2" color="text. secondary" sx={{ flexGrow: 1, mb: 2 }}>
                    {description}
                </Typography>
                <Button 
                    variant="contained" 
                    fullWidth 
                    onClick={() => router.push(href)}
                    sx={{ mt: 'auto' }}
                >
                    {buttonText}
                </Button>
            </CardContent>
        </Card>
    );
}