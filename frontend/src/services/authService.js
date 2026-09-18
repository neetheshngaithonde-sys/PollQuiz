import { apiRequest } from './api';

export const authService = {
  async register(name, email, password) {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
    return res.data;
  },

  async login(email, password) {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    return res.data;
  },

  async getMe() {
    const res = await apiRequest('/auth/me', {
      method: 'GET',
    });
    return res.data;
  },

  async changePassword(currentPassword, newPassword) {
    const res = await apiRequest('/auth/change-password', {
      method: 'PUT',
      body: {
        current_password: currentPassword,
        new_password: newPassword,
      },
    });
    return res.data;
  },
};
