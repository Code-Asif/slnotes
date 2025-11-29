import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

const useAuthStore = create(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      
      login: async (username, password) => {
        try {
          const response = await api.post('/admin/login', { username, password });
          set({
            admin: response.admin,
            token: response.token,
            isAuthenticated: true,
          });
          if (response.token) {
            localStorage.setItem('adminToken', response.token);
          }
          return response;
        } catch (error) {
          throw error;
        }
      },
      
      logout: async () => {
        try {
          await api.post('/admin/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            admin: null,
            token: null,
            isAuthenticated: false,
          });
          localStorage.removeItem('adminToken');
        }
      },
      
      checkAuth: () => {
        const token = localStorage.getItem('adminToken');
        if (token) {
          set({ token, isAuthenticated: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ admin: state.admin, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;

