// src/validations/timeSlotSchema.ts
import * as yup from 'yup';

export const timeSlotSchema = yup. object({
    date: yup
        .string()
        .required('Please select a date')
        .test('is-future-date', 'Cannot create time slot in the past', function (value) {
            if (! value) return true;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const selectedDate = new Date(value);
            return selectedDate >= today;
        }),
    startTime: yup
        .string()
        .required('Please select start time')
        .test('is-future-time', 'Cannot create time slot in the past', function (value) {
            const { date } = this.parent;
            if (! date || !value) return true;
            
            const now = new Date();
            const slotDateTime = new Date(`${date}T${value}`);
            return slotDateTime > now;
        }),
    endTime:  yup
        . string()
        .required('Please select end time')
        .test('is-after-start', 'End time must be after start time', function (value) {
            const { startTime } = this. parent;
            return startTime && value ?  value > startTime :  true;
        }),
});

// tạo TimeSlotFormData dùng khai báo kiểu dữ liệu cho useForm<>() định nghĩa dữ liệu cho Form
export type TimeSlotFormData = yup. InferType<typeof timeSlotSchema>;