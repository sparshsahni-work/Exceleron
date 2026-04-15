import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./authStore"; // Import authStore to update user profile

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api";

axios.defaults.withCredentials = true;

const handleApiError = (error, defaultMessage) => {
    const errorMessage = error.response?.data?.error || error.message || defaultMessage;
    console.error(defaultMessage, error);
    toast.error(errorMessage);
    return errorMessage;
};

export const useApiStore = create((set, get) => ({
    files: [], // This will store the user's chart history
    users: [], // For the admin panel
    isLoading: false,
    error: null,

    // --- Chart Operations ---
    saveChart: async (chartData) => {
        set({ isLoading: true });
        try {
            const payload = {
                title: chartData.metadata.fileName || "Untitled Chart",
                type: chartData.chartStyle || 'bar',
                data: {
                    labels: chartData.labels,
                    datasets: chartData.datasets,
                },
                sourceFile: { originalName: chartData.metadata.fileName },
                metadata: { rows: chartData.metadata.processedRows, columns: 2 }
            };
            await axios.post(`${API_URL}/charts`, payload);
            get().fetchFileHistory(); // Refresh history after saving
        } catch (error) {
            set({ error: handleApiError(error, "Failed to save chart") });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    fetchFileHistory: async () => {
        set({ isLoading: true });
        try {
            const response = await axios.get(`${API_URL}/charts/user`);
            set({ files: response.data.charts || [] });
        } catch (error) {
            set({ error: handleApiError(error, "Failed to fetch history") });
        } finally {
            set({ isLoading: false });
        }
    },
    
    deleteFile: async (fileId) => {
        set({ isLoading: true });
        try {
            await axios.delete(`${API_URL}/charts/${fileId}`);
            set((state) => ({
                files: state.files.filter((file) => file._id !== fileId),
            }));
        } catch (error) {
            set({ error: handleApiError(error, "Failed to delete chart") });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },



    incrementChartInsights: async (chartId) => {
        try {
            const response = await axios.post(`${API_URL}/charts/${chartId}/increment-insights`);
            // Update the specific chart in the local state to immediately reflect the new count
            set((state) => ({
                files: state.files.map((file) =>
                    file._id === chartId ? response.data : file
                ),
            }));
        } catch (error) {
            handleApiError(error, "Failed to increment chart insights");
        }
    },

    // --- User Operations (for Admin) ---
    fetchUsers: async () => {
        set({ isLoading: true });
        try {
            const response = await axios.get(`${API_URL}/users`);
            set({ users: response.data.users || [] });
        } catch (error) {
            set({ error: handleApiError(error, "Failed to fetch users") });
        } finally {
            set({ isLoading: false });
        }
    },


    // --- User Profile Operations ---
    updateUserProfile: async (userId, profileData) => {
        set({ isLoading: true });
        try {
            const response = await axios.put(`${API_URL}/users/${userId}`, profileData);
            // Also update the user in the authStore
            useAuthStore.setState({ user: response.data });
            toast.success("Profile updated successfully!");
        } catch (error) {
            set({ error: handleApiError(error, "Failed to update profile") });
        } finally {
            set({ isLoading: false });
        }
    },



    incrementUserAnalytics: async (field) => {
        try {
            const response = await axios.post(`${API_URL}/users/analytics/increment`, { field });
            // Update the user in the authStore with the fresh data from the backend.
            useAuthStore.setState({ user: response.data.user });
        } catch (error) {
            handleApiError(error, `Failed to update ${field} count`);
        }
    },



     // --- NEW ADMIN REQUEST FUNCTIONS ---
    requestAdminAccess: async (reason) => {
        set({ isLoading: true });
        try {
            const response = await axios.post(`${API_URL}/users/request-admin`, { reason });
            // Update the user in the authStore to reflect the pending status
            useAuthStore.setState({ user: response.data.user });
            toast.success("Admin request submitted!");
        } catch (error) {
            handleApiError(error, "Failed to submit admin request");
        } finally {
            set({ isLoading: false });
        }
    },

    getAdminRequests: async () => {
        set({ isLoading: true });
        try {
            const response = await axios.get(`${API_URL}/users/admin-requests`);
            return response.data;
        } catch (error) {
            handleApiError(error, "Failed to fetch admin requests");
            return [];
        } finally {
            set({ isLoading: false });
        }
    },

    respondToAdminRequest: async (userId, action) => {
        set({ isLoading: true });
        try {
            await axios.post(`${API_URL}/users/respond-admin-request/${userId}`, { action });
            toast.success(`Request has been ${action}d.`);
            get().fetchUsers(); // Refresh the main user list in the admin panel
        } catch (error) {
            handleApiError(error, "Failed to respond to request");
        } finally {
            set({ isLoading: false });
        }
    },


    
}));
