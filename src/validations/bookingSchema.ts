// src/validations/bookingSchema.ts
import * as yup from 'yup';

export const bookingSchema = yup.object({
    customerName:  yup
        .string()
        .required('Please enter customer name'),
    phoneNumber:  yup
        . string()
        .required('Please enter phone number')
        .matches(/^[0-9]+$/, 'Invalid phone number'),
    notes: yup
        .string()
        .default('')
});

export type BookingFormData = yup.InferType<typeof bookingSchema>;