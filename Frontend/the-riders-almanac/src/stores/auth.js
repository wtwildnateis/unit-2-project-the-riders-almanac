import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  token: null,
  user: null, // { id, username, roles:'ROLE_USER', 'ROLE_ADMIN', 'ROLE_MOD'
  login: (token, user) => set({ token, user }),
  logout: () => set({ token: null, user: null }),
  hasRole: (r) => {
    const u = useAuthStore.getState().user;
    return !!u && Array.isArray(u.roles) && u.roles.includes(r);
  }
}));