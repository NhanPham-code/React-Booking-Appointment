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
        username: 'patient1',
        password: 'patient123',
        role: 'patient',
        fullName: 'Jane Doe',
        email: 'patient1@email.com'
    },
    {
        id: '3',
        username: 'patient2',
        password: 'patient123',
        role: 'patient',
        fullName: 'Bob Johnson',
        email: 'patient2@email.com'
    }
];