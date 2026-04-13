import { create } from 'zustand';

interface UserInfo {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isApproved: boolean;
}

interface AuthState {
  user: UserInfo | null;
  token: string | null;
  login: (user: UserInfo, token: string) => void;
  logout: () => void;
  loadUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: (user, token) => {
    localStorage.setItem('popmart_token', token);
    localStorage.setItem('popmart_user', JSON.stringify(user));
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('popmart_token');
    localStorage.removeItem('popmart_user');
    set({ user: null, token: null });
  },
  loadUser: () => {
    const token = localStorage.getItem('popmart_token');
    const userStr = localStorage.getItem('popmart_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token });
      } catch {
        localStorage.removeItem('popmart_token');
        localStorage.removeItem('popmart_user');
      }
    }
  },
}));
