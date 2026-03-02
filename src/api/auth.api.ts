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
        bio: string;
        profile_picture: string | null;
        profile_picture_url: string | null;
        google_picture_url: string | null;
        auth_provider: string;
        has_preferences: boolean;
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

export const getMe = async () => {
    const response = await api.get<AuthResponse['user']>('/auth/me/');
    return response.data;
};

export const updateProfile = async (data: {
    bio?: string;
    profile_picture?: File | null;
    remove_picture?: boolean;
}) => {
    const formData = new FormData();
    if (data.bio !== undefined) formData.append('bio', data.bio);
    if (data.remove_picture) formData.append('remove_picture', 'true');
    if (data.profile_picture) formData.append('profile_picture', data.profile_picture);

    const response = await api.patch<AuthResponse['user']>('/auth/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};
