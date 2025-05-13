import { TeamType } from './team';

export interface UserType {
    id: number;
    email: string;
    role: 'GUEST' | 'ADMIN';
    teams?: TeamType[];
}