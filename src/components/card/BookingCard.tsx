import { BookingWithStatus } from "@/src/utils/bookingUtils";
import {
    Box, Paper, Typography, Stack, Chip,
    IconButton, Avatar, Tooltip, Divider, useTheme, alpha, Grid
} from '@mui/material';

// Icons
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NotesIcon from '@mui/icons-material/Notes';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonIcon from '@mui/icons-material/Person';

interface BookingCardProps {
    booking: BookingWithStatus;
    isDoctor: boolean;
    onDelete: () => void;
    isDeleting: boolean;
    onReschedule?: () => void;
}

export default function BookingCard({ booking, isDoctor, onDelete, isDeleting, onReschedule }: BookingCardProps) {
    const theme = useTheme();

    // 1. Màu sắc Status
    const getStatusColor = () => {
        switch (booking.status) {
            case 'today': return theme.palette.warning.main;
            case 'upcoming': return theme.palette.success.main;
            case 'past': return theme.palette.grey[500];
            default: return theme.palette.primary.main;
        }
    };

    const statusColor = getStatusColor();
    const isPast = booking.status === 'past';

    // 2. Format Date/Time
    const dateObj = new Date(booking.startTime);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const timeStart = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timeEnd = new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 3. Helper render thông tin người dùng (Reusable cho cả Dr và Patient)
    const renderUserInfo = (
        role: 'Doctor' | 'Patient',
        name: string,
        email?: string,
        phone?: string,
        highlight: boolean = false
    ) => {
        const Icon = role === 'Doctor' ? LocalHospitalIcon : PersonIcon;
        const iconColor = role === 'Doctor' ? theme.palette.error.main : theme.palette.info.main;
        const bgIcon = role === 'Doctor' ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.info.main, 0.1);

        return (
            <Box display="flex" gap={1.5} alignItems="flex-start">
                <Avatar
                    sx={{
                        width: 32, height: 32,
                        bgcolor: highlight ? bgIcon : 'grey.100',
                        color: highlight ? iconColor : 'grey.500'
                    }}
                >
                    <Icon sx={{ fontSize: 18 }} />
                </Avatar>
                <Box>
                    <Typography
                        variant={highlight ? "h6" : "subtitle2"}
                        fontWeight={highlight ? 700 : 600}
                        lineHeight={1.2}
                        color={highlight ? 'text.primary' : 'text.secondary'}
                    >
                        {role === 'Doctor' ? `Dr. ${name}` : name}
                    </Typography>

                    {/* Contact Info Group */}
                    <Stack direction="column" spacing={0.5} mt={0.5}>
                        {phone && (
                            <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
                                <PhoneIcon sx={{ fontSize: 12 }} />
                                <Typography variant="caption">{phone}</Typography>
                            </Box>
                        )}
                        {email && (
                            <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
                                <EmailIcon sx={{ fontSize: 12 }} />
                                <Typography variant="caption" noWrap sx={{ maxWidth: 150 }}>{email}</Typography>
                            </Box>
                        )}
                    </Stack>
                </Box>
            </Box>
        );
    };

    return (
        <Paper
            elevation={0}
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                overflow: 'hidden',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s',
                opacity: isPast ? 0.75 : 1,
                bgcolor: 'white',
                '&:hover': {
                    transform: isPast ? 'none' : 'translateY(-2px)',
                    boxShadow: isPast ? 'none' : theme.shadows[3],
                    borderColor: isPast ? 'divider' : statusColor,
                }
            }}
        >
            <Box
                sx={{
                    width: { xs: '100%', sm: 90 },
                    bgcolor: alpha(statusColor, 0.08),
                    display: 'flex',
                    flexDirection: { xs: 'row', sm: 'column' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2,
                    borderRight: { sm: `1px solid ${alpha(statusColor, 0.1)}` },
                    color: statusColor
                }}
            >
                <Typography variant="h5" fontWeight="900" sx={{ mr: { xs: 1, sm: 0 } }}>
                    {day}
                </Typography>
                <Typography variant="caption" fontWeight="bold" sx={{ letterSpacing: 1 }}>
                    {month}
                </Typography>
            </Box>

            <Box sx={{ flex: 1, p: 2 }}>

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Chip
                        label={booking.statusLabel || booking.status}
                        size="small"
                        sx={{
                            bgcolor: alpha(statusColor, 0.1),
                            color: statusColor,
                            fontWeight: 700,
                            height: 24
                        }}
                    />
                    <Typography variant="caption" color="text.disabled">
                        ID: #{booking.id}
                    </Typography>
                </Box>

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        {isDoctor
                            ? renderUserInfo('Patient', booking.patientName, booking.patientEmail, booking.patientPhoneNumber, true)
                            : renderUserInfo('Doctor', booking.doctorName, booking.doctorEmail, booking.doctorPhoneNumber, true)
                        }
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        {isDoctor
                            ? renderUserInfo('Doctor', booking.doctorName, booking.doctorEmail, booking.doctorPhoneNumber, false)
                            : renderUserInfo('Patient', booking.patientName, booking.patientEmail, booking.patientPhoneNumber, false)
                        }
                    </Grid>
                </Grid>

                <Divider sx={{ my: 1.5, borderStyle: 'double' }} />

                <Stack spacing={1}>
                    <Box display="flex" alignItems="center" color="text.primary" gap={1}>
                        <AccessTimeIcon color="action" sx={{ fontSize: 18 }} />
                        <Typography variant="body2" fontWeight={600}>
                            {timeStart} - {timeEnd}
                        </Typography>
                    </Box>

                    {booking.notes && (
                        <Paper
                            elevation={0}
                            sx={{
                                bgcolor: 'grey.50',
                                p: 1,
                                borderRadius: 1.5,
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1,
                                border: '1px solid',
                                borderColor: 'grey.200'
                            }}
                        >
                            <NotesIcon sx={{ fontSize: 16, color: 'text.secondary', mt: 0.3 }} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                {booking.notes}
                            </Typography>
                        </Paper>
                    )}
                </Stack>
            </Box>

            {!isPast && (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'row', sm: 'column' },
                        justifyContent: 'center',
                        alignItems: 'center',
                        p: 1.5,
                        borderLeft: { sm: '1px solid' },
                        borderTop: { xs: '1px solid', sm: 'none' },
                        borderColor: 'divider',
                        gap: 1
                    }}
                >
                    <Tooltip title="Reschedule" arrow placement="left">
                        <IconButton
                            onClick={onReschedule}
                            size="small"
                            sx={{
                                color: 'primary.main',
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                '&:hover': { bgcolor: theme.palette.primary.main, color: 'white' }
                            }}
                        >
                            <EditCalendarIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Cancel" arrow placement="left">
                        <IconButton
                            onClick={onDelete}
                            disabled={isDeleting}
                            size="small"
                            sx={{
                                color: 'error.main',
                                bgcolor: alpha(theme.palette.error.main, 0.05),
                                '&:hover': { bgcolor: theme.palette.error.main, color: 'white' }
                            }}
                        >
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}
        </Paper>
    );
}