// Common/shared types

export interface ApiResponse<T> {
    data: T;
    error?: string;
    status: number;
}
