import api from './axios';

export interface DashboardStats {
    trips_created: number;
    trips_joined: number;
}

export interface Trip {
    id: number;
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
    description: string;
    max_members: number;
    created_by: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
    members: Array<{
        id: number;
        user: {
            id: number;
            first_name: string;
            last_name: string;
            email: string;
        };
        status: string;
    }>;
    created_at: string;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/trips/dashboard/stats/');
    return response.data;
};

export const getTripById = async (tripId: number): Promise<Trip> => {
    const response = await api.get<Trip>(`/trips/${tripId}/`);
    return response.data;
};

export const getTrips = async (): Promise<Trip[]> => {
    const response = await api.get<Trip[]>('/trips/');
    return response.data;
};
