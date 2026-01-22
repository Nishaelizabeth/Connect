import api from './axios';

export interface AuthResponse {
    tokens: {
        access: string;
        refresh: string;
    };
    user: {
        id: number;
        email: string;
        full_name: string;
    };
    message?: string;
}

export const registerUser = async (data: { full_name: string; email: string; password: string; password_confirm: string }) => {
    const response = await api.post<AuthResponse>('/auth/register/', data);
    return response.data;
};

export const loginUser = async (data: { email: string; password: string }) => {
    const response = await api.post<AuthResponse>('/auth/login/', data);
    return response.data;
};

export const googleAuth = async (access_token: string) => {
    const response = await api.post<AuthResponse>('/auth/google/', { access_token });
    return response.data;
};
