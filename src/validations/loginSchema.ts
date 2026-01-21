import * as yup from 'yup';

// ===== VALIDATION SCHEMA =====
export const loginSchema = yup.object({
    username: yup.string().required('Username is required'),
    password: yup.string().required('Password is required'),
});


export type LoginFormData = yup.InferType<typeof loginSchema>;