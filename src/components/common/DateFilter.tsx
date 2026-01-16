// src/components/common/DateFilter.tsx
'use client';

import { Box, TextField, Typography, Chip, Stack } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface DateFilterProps {
    selectedDate:  string;
    onChange:  (date: string) => void;
    label?:  string;
}

export default function DateFilter({ selectedDate, onChange, label = "Select Date" }:  DateFilterProps) {
    const today = new Date().toISOString().split('T')[0]; // chỉ lấy ngày bỏ giờ
    
    // Tạo quick select buttons cho 7 ngày tới
    // const getNextDays = (count: number) => {
    //     const days = [];
    //     for (let i = 0; i < count; i++) {
    //         const date = new Date();
    //         date.setDate(date.getDate() + i);
    //         days.push({
    //             date: date.toISOString().split('T')[0],
    //             label: i === 0 ?  'Today' :  i === 1 ?  'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    //         });
    //     }
    //     return days;
    // };

    //const quickDays = getNextDays(7);

    return (
        <Box sx={{ mb: 3 }}>
            {/* <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon color="primary" fontSize="small" />
                {label}
            </Typography> */}

            {/* Quick Select Chips */}
            {/* <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                {quickDays. map((day) => (
                    <Chip
                        key={day. date}
                        label={day.label}
                        onClick={() => onChange(day.date)}
                        color={selectedDate === day. date ? 'primary' : 'default'}
                        variant={selectedDate === day. date ? 'filled' : 'outlined'}
                        sx={{ 
                            cursor: 'pointer',
                            '&:hover': { 
                                bgcolor: selectedDate === day.date ? 'primary. main' : 'action.hover' 
                            }
                        }}
                    />
                ))}
            </Stack> */}

            {/* Date Picker */}
            <TextField
                type="date"
                value={selectedDate} // show data
                onChange={(e) => onChange(e. target.value)} // callback lên parent xử lí khi filter date
                size="small"
                slotProps={{
                    inputLabel: { shrink: true },
                    //htmlInput: { min: today }
                }}
                sx={{ minWidth: 200 }}
            />
        </Box>
    );
}