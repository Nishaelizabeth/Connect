export const getAccessToken = (): string | null => {
    return localStorage.getItem('accessToken');
};

export const isAuthenticated = (): boolean => {
    return !!getAccessToken();
};

export const logout = (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
};
