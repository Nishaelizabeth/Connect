import api from './axios';

export interface DashboardStats {
    trips_created: number;
    trips_joined: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/trips/dashboard/stats/');
    return response.data;
};
