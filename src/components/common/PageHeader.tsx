// src/components/common/PageHeader.tsx
import { Box, Typography } from '@mui/material';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
    return (
        <Box sx={{ mb: { xs: 3, sm: 4 }, textAlign: 'center', px: { xs: 1, sm: 2 } }}>
            <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom 
                sx={{ 
                    background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '1.75rem', sm: '2.125rem', md: '2.5rem' },
                    fontWeight: 700,
                    lineHeight: 1.2
                }}
            >
                {title}
            </Typography>
            {subtitle && (
                <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ 
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        maxWidth: '800px',
                        mx: 'auto'
                    }}
                >
                    {subtitle}
                </Typography>
            )}
        </Box>
    );
}