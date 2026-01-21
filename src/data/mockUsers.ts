import { IUser } from '@/src/models/authentication';

export const MOCK_USERS: IUser[] = [
    {
        id: '1',
        username: 'doctor',
        password: 'doctor123',
        role: 'doctor',
        fullName: 'Dr. John Smith',
        email: 'doctor@hospital.com'
    },
    {
        id: '2',
        username: 'patient',
        password: 'patient123',
        role: 'patient',
        fullName: 'Jane Doe',
        email: 'patient@email.com'
    }
];