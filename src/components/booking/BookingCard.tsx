import { BookingWithStatus } from "@/src/utils/bookingUtils";
import DeleteIcon from '@mui/icons-material/Delete';
import PhoneIcon from '@mui/icons-material/Phone';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import TodayIcon from '@mui/icons-material/Today';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventIcon from '@mui/icons-material/Event';
import {
    Box, Paper, Typography, Stack, Chip,
    IconButton, Avatar, Tooltip
} from '@mui/material';

// Booking Card Component
interface BookingCardProps {
    booking: BookingWithStatus; // Booking details with status
    isDoctor: boolean; // Flag to indicate if the user is a doctor
    onDelete: () => void; // Callback for delete action
    isDeleting: boolean; // Flag to indicate if deletion is in progress
    onReschedule?: () => void; // Callback for reschedule action
}

/**
 * BookingCard component to display booking details.
 * @param param0 Component props.
 * @returns JSX.Element
 */
export default function BookingCard({ booking, isDoctor, onDelete, isDeleting, onReschedule }: BookingCardProps) {
    const getStatusIcon = () => {
        switch (booking.status) {
            case 'today': return <TodayIcon />;
            case 'upcoming': return <ScheduleIcon />;
            case 'past': return <CheckCircleIcon />;
        }
    };

    return (
        <Paper
            sx={{
                p: 3,
                opacity: booking.status === 'past' ? 0.7 : 1,
                borderLeft: '4px solid',
                borderColor: booking.status === 'today'
                    ? 'warning.main'
                    : booking.status === 'upcoming'
                        ? 'success.main'
                        : 'grey.400'
            }}
        >
            <Stack spacing={2}>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{
                            bgcolor: booking.status === 'past' ? 'grey.400' : 'primary.main',
                            width: 48,
                            height: 48
                        }}>
                            {booking.customerName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="h6" fontWeight={600}>
                                    {booking.customerName}
                                </Typography>
                                <Chip
                                    size="small"
                                    label={booking.statusLabel}
                                    color={booking.statusColor}
                                    icon={getStatusIcon()}
                                />
                            </Stack>
                            <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">
                                    <PhoneIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                                    {booking.phoneNumber}
                                </Typography>
                                {booking.notes && (
                                    <Typography variant="body2" color="text.secondary">
                                        📝 {booking.notes}
                                    </Typography>
                                )}
                            </Stack>
                        </Box>
                    </Stack>

                    {/* Actions - Only for non-past bookings */}
                    {booking.status !== 'past' && (
                        <Stack direction="row" spacing={1}>
                            {/* Reschedule and Delete Buttons*/}
                            <Tooltip title="Reschedule">
                                <IconButton
                                    color="primary"
                                    size="small"
                                    onClick={onReschedule}> {/* callback */}
                                    <EventRepeatIcon />
                                </IconButton>
                            </Tooltip>

                            {/* Delete Button */}
                            <Tooltip title="Cancel Booking">
                                <IconButton
                                    color="error"
                                    size="small"
                                    disabled={isDeleting}
                                    onClick={onDelete}> {/* callback */}
                                    
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    )}
                </Box>

                {/* Time Slots */}
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        📅 Booked Time Slots:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                            label={`${new Date(booking.startTime).toLocaleDateString()} | ${new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                            color="info"
                            size="small"
                            icon={<EventIcon />}
                        />
                    </Stack>
                </Box>

                {/* Doctor-only:  Show who created the booking */}
                {isDoctor && (
                    <Typography variant="caption" color="text.secondary">
                        🆔 Booking ID: {booking.id} | Created: {new Date(booking.createdAt).toLocaleString()}
                    </Typography>
                )}
            </Stack>
        </Paper>
    );
}
