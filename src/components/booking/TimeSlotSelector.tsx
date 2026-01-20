// src/components/booking/TimeSlotSelector.tsx
'use client';

import { Box, Card, Typography, Chip, Grid, alpha, CircularProgress, Stack } from '@mui/material';
import { ITimeSlot } from '@/src/models/timeSlot';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import EventBusyIcon from '@mui/icons-material/EventBusy';

interface TimeSlotWithStatus extends ITimeSlot {
    isPast:  boolean;
}

// định nghĩa props nhận từ parent
interface TimeSlotSelectorProps {
    slots: TimeSlotWithStatus[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    isLoading?: boolean;
    selectedDate:  string;
}

export default function TimeSlotSelector({
    slots,
    selectedIds,
    onChange,
    isLoading = false,
    selectedDate
}: TimeSlotSelectorProps) {

    // xử lí việc chọn/bỏ chọn của user
    const handleToggle = (slot: TimeSlotWithStatus) => {
        // Không cho chọn slot đã book hoặc trong quá khứ
        if (slot.isBooked || slot.isPast) return;

        if (selectedIds.includes(slot.id)) {
            // bỏ id ra nếu bỏ chọn và callback về BookingForm để update lại 
            onChange(selectedIds.filter(id => id !== slot.id));
        } else {
            // thêm id vào và callback về BookingForm
            onChange([...selectedIds, slot.id]);
        }
    };

    // check xem useQuery() fetch data xong chưa (chưa thì hiển thị loading)
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    // check chọn date chưa
    if (! selectedDate) {
        return (
            <Card sx={{ p: 4, textAlign: 'center', bgcolor: 'grey. 50' }}>
                <AccessTimeIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography color="text.secondary">
                    Please select a date to view available time slots. 
                </Typography>
            </Card>
        );
    }

    if (slots.length === 0) {
        return (
            <Card sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                <EventBusyIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography color="text.secondary">
                    No time slots available for this date.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Please select another date or contact admin to add slots.
                </Typography>
            </Card>
        );
    }

    // Đếm số lượng theo status
    const availableCount = slots.filter(s => !s.isBooked && !s.isPast).length;
    const bookedCount = slots. filter(s => s.isBooked).length;
    const pastCount = slots. filter(s => s.isPast).length;

    return (
        <Box>
            {/* Status Summary */}
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Chip
                    size="small"
                    label={`${availableCount} Available`}
                    color="success"
                    variant="outlined"
                />
                <Chip
                    size="small"
                    label={`${bookedCount} Booked`}
                    color="error"
                    variant="outlined"
                />
                {pastCount > 0 && (
                    <Chip
                        size="small"
                        label={`${pastCount} Past`}
                        color="default"
                        variant="outlined"
                    />
                )}
                {selectedIds.length > 0 && (
                    <Chip
                        size="small"
                        label={`${selectedIds.length} Selected`}
                        color="primary"
                    />
                )}
            </Stack>

            {/* Time Slot Grid */}
            <Grid container spacing={2}>
                {slots. map((slot) => {
                    const isSelected = selectedIds. includes(slot.id);
                    const isDisabled = slot.isBooked || slot. isPast;

                    return (
                        <Grid size={{ xs: 6, sm: 4, md: 3 }} key={slot.id}>
                            <Card
                                onClick={() => handleToggle(slot)} // call toggle để xử lí click và callback Booking Form để update selected slots
                                sx={{
                                    p: 2,
                                    cursor:  isDisabled ? 'not-allowed' :  'pointer',
                                    border: '2px solid',
                                    borderColor:  isSelected
                                        ? 'primary.main'
                                        :  slot.isBooked
                                            ? 'error. light'
                                            : slot.isPast
                                                ? 'grey.300'
                                                : 'grey. 200',
                                    bgcolor: isSelected
                                        ? alpha('#6366f1', 0.08)
                                        : slot.isBooked
                                            ? alpha('#ef4444', 0.05)
                                            : slot.isPast
                                                ? 'grey.100'
                                                : 'background.paper',
                                    opacity: isDisabled ?  0.7 : 1,
                                    transition: 'all 0.2s ease',
                                    '&: hover': ! isDisabled ?  {
                                        borderColor: 'primary.main',
                                        transform: 'translateY(-2px)',
                                        boxShadow: 2,
                                    } : {},
                                    position: 'relative',
                                }}
                            >
                                {/* Status Icon */}
                                {isSelected && (
                                    <CheckCircleIcon
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            color: 'primary.main',
                                            fontSize: 20,
                                        }}
                                    />
                                )}
                                {slot.isBooked && (
                                    <LockIcon
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right:  8,
                                            color: 'error.main',
                                            fontSize: 18,
                                        }}
                                    />
                                )}

                                {/* Time */}
                                <Typography
                                    variant="body2"
                                    fontWeight={600}
                                    color={
                                        isSelected
                                            ? 'primary.main'
                                            :  slot.isBooked
                                                ? 'error.main'
                                                : slot. isPast
                                                    ? 'text.disabled'
                                                    : 'text.primary'
                                    }
                                >
                                    {slot.startTime} - {slot.endTime}
                                </Typography>

                                {/* Status Label */}
                                <Typography variant="caption" color="text. secondary">
                                    {slot.isBooked
                                        ? 'Booked'
                                        :  slot.isPast
                                            ? 'Past'
                                            : 'Available'}
                                </Typography>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
}