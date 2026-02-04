// src/validations/bookingSchema.ts
import * as yup from 'yup';

export const bookingSchema = yup.object({
    customerName: yup
        .string()
        .required('Please enter customer name'),
    notes: yup
        .string()
        .default('')
});

export type BookingFormData = yup.InferType<typeof bookingSchema>;