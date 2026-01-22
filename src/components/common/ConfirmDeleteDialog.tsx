// src/components/common/ConfirmDeleteDialog.tsx
'use client';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    CircularProgress,
    Box
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface ConfirmDeleteDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading?:  boolean;
    title?:  string;
    message?: string;
}

export default function ConfirmDeleteDialog({
    open,
    onClose,
    onConfirm,
    loading = false,
    title = 'Confirm Delete',
    message = 'Are you sure you want to delete this item?  This action cannot be undone.'
}: ConfirmDeleteDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <WarningAmberIcon color="warning" />
                    {title}
                </Box>
            </DialogTitle>
            <DialogContent>
                <Typography>{message}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button 
                    onClick={onConfirm} 
                    color="error" 
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ?  <CircularProgress size={16} /> : null}
                >
                    {loading ? 'Deleting.. .' : 'Confirm'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}