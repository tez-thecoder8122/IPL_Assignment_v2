import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// API endpoints
export const apiService = {
  // Task 1: Get matches per year data
  getMatchesPerYear: async () => {
    try {
      const response = await api.get('/matches-per-year/');
      return response.data;
    } catch (error) {
      console.error('Error fetching matches per year:', error);
      throw error;
    }
  },

  // Task 2: Get team wins stacked data
  getTeamWinsStacked: async () => {
    try {
      const response = await api.get('/team-wins-stacked/');
      return response.data;
    } catch (error) {
      console.error('Error fetching team wins stacked:', error);
      throw error;
    }
  },

  // Task 3: Get extra runs per team for a specific year
  getExtraRunsPerTeam: async (year) => {
    try {
      const response = await api.get(`/extra-runs-per-team/${year}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching extra runs per team:', error);
      throw error;
    }
  },

  // Task 4: Get economical bowlers for a specific year
  getEconomicalBowlers: async (year) => {
    try {
      const response = await api.get(`/economical-bowlers/${year}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching economical bowlers:', error);
      throw error;
    }
  },

  // Task 5: Get matches played vs won for a specific year
  getMatchesPlayedVsWon: async (year) => {
    try {
      const response = await api.get(`/matches-played-vs-won/${year}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching matches played vs won:', error);
      throw error;
    }
  },

  // Get available years
  getAvailableYears: async () => {
    try {
      const response = await api.get('/available-years/');
      return response.data;
    } catch (error) {
      console.error('Error fetching available years:', error);
      throw error;
    }
  },

  // Get all teams
  getTeams: async () => {
    try {
      const response = await api.get('/teams-list/');
      return response.data;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  },
};

export default api;