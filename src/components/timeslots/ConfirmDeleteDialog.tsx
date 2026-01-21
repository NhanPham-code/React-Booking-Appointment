// src/components/timeslots/ConfirmDeleteDialog.tsx
import React from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, Typography, Alert 
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

interface Props {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
}

export default function ConfirmDeleteDialog({ open, onClose, onConfirm, loading }: Props) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                <WarningIcon />
                Confirm Delete
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1">
                    Are you sure you want to delete this time slot?
                </Typography>
                <Alert severity="warning" sx={{ mt: 2, fontSize: '0.875rem' }}>
                    This action cannot be undone.
                </Alert>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading} color="inherit">
                    Cancel
                </Button>
                <Button 
                    onClick={onConfirm} 
                    color="error" 
                    variant="contained" 
                    autoFocus
                    disabled={loading}
                >
                    {loading ? 'Deleting...' : 'Delete'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}