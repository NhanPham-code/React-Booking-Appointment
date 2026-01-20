// src/components/common/DateFilter.tsx
'use client';

import { Box, TextField } from '@mui/material';

interface DateFilterProps {
    selectedDate:  string;
    onChange:  (date: string) => void;
    label?:  string;
    minDate?: string | null;
}

export default function DateFilter({ selectedDate, onChange, minDate }:  DateFilterProps) {
    const today = new Date().toISOString().split('T')[0]; // chỉ lấy day bỏ giờ

    const inputMinDate = minDate === undefined ? today : (minDate || undefined);

    return (
        <Box sx={{ mb: 3 }}>
            {/* Date Picker */}
            <TextField
                type="date"
                value={selectedDate} // show data
                onChange={(e) => onChange(e. target.value)} // callback lên parent xử lí khi filter date
                size="small"
                slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: { min: inputMinDate }
                }}
                sx={{ minWidth: 200 }}
            />
        </Box>
    );
}