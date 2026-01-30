// User-related types

export interface User {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    address?: string;
    is_staff?: boolean;
    is_superuser?: boolean;
    is_active?: boolean;
    date_joined?: string;
    last_login?: string;
}

export interface UserListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: User[];
}
