import { apiRequest } from './api';

export const pollService = {
  async createPoll(question, options) {
    const res = await apiRequest('/polls', {
      method: 'POST',
      body: { question, options },
    });
    return res.data;
  },

  async getMyPolls() {
    const res = await apiRequest('/polls/my', {
      method: 'GET',
    });
    return res.data;
  },

  async getPoll(id) {
    const res = await apiRequest(`/polls/${id}`, {
      method: 'GET',
    });
    return res.data;
  },

  async getPollResults(id) {
    const res = await apiRequest(`/polls/${id}/results`, {
      method: 'GET',
    });
    return res.data;
  },

  async vote(pollId, optionId, fingerprint) {
    const res = await apiRequest(`/polls/${pollId}/vote`, {
      method: 'POST',
      body: { option_id: optionId, fingerprint },
    });
    return res.data;
  },

  async toggleStatus(pollId, isActive) {
    const res = await apiRequest(`/polls/${pollId}/status`, {
      method: 'PATCH',
      body: { is_active: isActive },
    });
    return res.data;
  },

  async deletePoll(pollId) {
    const res = await apiRequest(`/polls/${pollId}`, {
      method: 'DELETE',
    });
    return res.data;
  },
};
