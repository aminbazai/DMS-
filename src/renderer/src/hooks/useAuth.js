import { create } from 'zustand';

const useAuth = create((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (username, password) => {
    const result = await window.electronAPI.login({ username, password });
    if (result.success) {
      set({ user: result.user, isAuthenticated: true });
    }
    return result;
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
  setUser: (user) => set({ user, isAuthenticated: true }),
}));

export default useAuth;
