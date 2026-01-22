// src/components/common/PageHeader.tsx
import { Box, Typography } from '@mui/material';

interface PageHeaderProps {
    title: string;
}

export default function PageHeader({ title }: PageHeaderProps) {
    return (
        <Box sx={{ mb: { xs: 3, sm: 4 }, textAlign: 'center', px: { xs: 1, sm: 2 } }}>
            <Typography 
                variant="h4" 
                component="h4" 
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
        </Box>
    );
}