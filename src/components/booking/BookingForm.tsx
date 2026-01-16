// src/components/booking/BookingForm.tsx
'use client';

import React from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, TextField, Stack, Card, CardContent, Typography, Alert, Divider } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/src/services/bookingServices';
import { timeSlotService } from '@/src/services/timeSlotServices';
import { bookingSchema, BookingFormData } from '@/src/validations/bookingSchema';
import { CreateBookingDTO } from '@/src/models/booking';
import TimeSlotSelector from './TimeSlotSelector';
import DateFilter from '@/src/components/common/DateFilter';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PersonIcon from '@mui/icons-material/Person';
import { QUERY_KEYS } from '@/src/constants/queryKey';

export default function BookingForm() {
    const queryClient = useQueryClient();
    const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
    const [selectedDate, setSelectedDate] = React.useState<string>('');

    const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<BookingFormData>({
        resolver: yupResolver(bookingSchema),
        mode: 'onChange', // // Validate mỗi khi field thay đổi (default: onSubmit mới check)
        defaultValues: {
            customerName: '',
            phoneNumber: '',
            timeSlotIds: [], // Mảng IDs của slots được chọn
            notes: ''
        }
    });

    // Fetch slots theo ngày - chỉ chạy khi có selectedDate
    const { data: slotsWithStatus = [], isLoading: loadingSlots } = useQuery({
        queryKey: QUERY_KEYS.TIME_SLOTS.BY_DATE(selectedDate), // Cache key - unique cho mỗi ngày
        queryFn: () => timeSlotService.getSlotsByDateWithStatus(selectedDate),
        enabled: !!selectedDate,  // Chỉ fetch khi có ngày được chọn (điều kiện để fetch)
        staleTime: 1 * 60 * 1000,    // Data mới trong 1 phút (trong 1 phút sẽ sử dụng data trong cache -> tăng độ mượt)
        refetchInterval: 30000,      // Auto refetch mỗi 30s (không cần trigger) để luôn sync data
        refetchIntervalInBackground: false, // khi user thu nhỏ màn hình hay chuyển tab sẽ không auto refetch nữa
        refetchOnWindowFocus: true, // khi user trở lại tab thì sẽ refetch lại dữ liệu mới
    });

    // create new booking
    const createMutation = useMutation({
        mutationFn: async (data: BookingFormData) => {
            // Lọc slots hợp lệ từ form data
            // lọc lại các Slots được chọn bằng timeSlotIds (lưu các id mà người dùng chọn trong Form)
            const selectedSlots = slotsWithStatus.filter(
                slot => data.timeSlotIds.includes(slot.id) && !slot.isBooked && !slot.isPast
            );

            if (selectedSlots.length === 0) {
                throw new Error('No valid time slots selected'); // onError check
            }

            const bookingData: CreateBookingDTO = {
                customerName: data.customerName,
                phoneNumber: data.phoneNumber,
                notes: data.notes || '',
                timeSlots: selectedSlots.map(slot => ({
                    timeSlotId: slot.id,
                    date: slot.date,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                }))
            };

            return bookingService.create(bookingData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS.ALL }); // thông báo refresh lại booking list
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_SLOTS.ALL }); // thông báo refresh lại hiển thị Booked slot
            reset(); // reset form
            setSuccessMsg('Booking created successfully!');
            setErrorMsg(null);
            setTimeout(() => setSuccessMsg(null), 3000);
        },
        onError: (error: Error) => { // xử lí exception
            setErrorMsg(error.message || 'Failed to create booking.  Please try again.');
        }
    });

    // submit form
    const onSubmit = (data: BookingFormData) => {
        createMutation.mutate(data);
    };

    // Callback từ TimeSlotSelector khi user chọn/bỏ chọn slot
    const handleTimeSlotChange = (ids: string[]) => {
        // callback từ TimeSlotSelector để Form cập nhật
        // shouldValidate: true → Chạy Schema validation để hiện error nếu bỏ chọn hết và lưu lại vào form state để submit
        setValue('timeSlotIds', ids, { shouldValidate: true });
    };

    // callback từ TimeSlotSelector khi user đối ngày
    const handleDateChange = (date: string) => {
        // cập nhật selectedDate để fetch lại slots mới
        setSelectedDate(date);
        // clear timeSlotIds để chọn các slot của ngày mới
        setValue('timeSlotIds', [], { shouldValidate: false });
    };

    // Theo dõi timeSlotIds trong form để render Summary real-time
    const selectedTimeSlotIds = useWatch({
        control,
        name: 'timeSlotIds', // theo dõi timeSlotIds của Form
        defaultValue: []
    });

    // Lấy thông tin slots đã chọn để hiển thị summary
    const selectedSlots = slotsWithStatus.filter(slot => selectedTimeSlotIds?.includes(slot.id));

    return (
        // Wrap hàm onSubmit - chạy validation trước, nếu pass mới gọi onSubmit
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
                {/* Step 1: Select Date & Time Slots */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EventAvailableIcon color="primary" />
                            Step 1: Choose Date & Time
                        </Typography>

                        {/* Date Filter */}
                        <DateFilter
                            selectedDate={selectedDate} // ngày chọn
                            onChange={handleDateChange} // xử lí callback về BookingForm
                        />

                        {/* Time Slot Selector */}
                        <TimeSlotSelector
                            slots={slotsWithStatus}  // danh sách slots
                            selectedIds={selectedTimeSlotIds || []} // truyền data Ids đã được chọn
                            onChange={handleTimeSlotChange} // truyền hàm callback để xử lí khi chọn
                            isLoading={loadingSlots}
                            selectedDate={selectedDate}
                        />

                        {errors.timeSlotIds && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {errors.timeSlotIds.message}
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* Step 2: Customer Information */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon color="primary" />
                            Step 2: Your Information
                        </Typography>

                        {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
                        {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

                        <Stack spacing={2}>
                            {/* Controller kết nối TextField với form state để check validation */}
                            <Controller
                                name="customerName" // khớp schema
                                control={control} // kết nối Controller với form state
                                render={({ field }) => (
                                    <TextField
                                        {...field} // tự động bind value vào form state + onchange
                                        label="Customer Name"
                                        placeholder="Enter your full name"
                                        error={!!errors.customerName}
                                        helperText={errors.customerName?.message}
                                        fullWidth
                                    />
                                )}
                            />

                            <Controller
                                name="phoneNumber"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Phone Number"
                                        placeholder="Enter your phone number"
                                        error={!!errors.phoneNumber}
                                        helperText={errors.phoneNumber?.message}
                                        fullWidth
                                    />
                                )}
                            />

                            <Controller
                                name="notes"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Notes (Optional)"
                                        placeholder="Any special requests or notes..."
                                        multiline
                                        rows={3}
                                        fullWidth
                                    />
                                )}
                            />

                            <Divider />

                            {/* Summary */}
                            {selectedSlots.length > 0 && (
                                <Box sx={{ bgcolor: 'primary.50', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'primary.200' }}>
                                    <Typography variant="subtitle2" color="primary.main" gutterBottom fontWeight={600}>
                                        📋 Booking Summary
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Date: <strong>{selectedDate}</strong>
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {selectedSlots.length} time slot(s) selected:
                                    </Typography>
                                    <Stack spacing={0.5} sx={{ mt: 1 }}>
                                        {selectedSlots.map(slot => (
                                            <Typography key={slot.id} variant="body2" color="primary.main">
                                                • {slot.startTime} - {slot.endTime}
                                            </Typography>
                                        ))}
                                    </Stack>
                                </Box>
                            )}

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={createMutation.isPending || !selectedSlots.length}
                                sx={{ py: 1.5 }}
                            >
                                {createMutation.isPending ? 'Processing...' : 'Confirm Booking'}
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>
        </Box>
    );
}