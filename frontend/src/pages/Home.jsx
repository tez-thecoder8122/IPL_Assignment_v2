import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Alert,
  Container
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import ChartContainer from '../components/ChartContainer';
import { apiService } from '../services/api';
import HomeIcon from '@mui/icons-material/Home';

const Home = () => {
  const [matchesData, setMatchesData] = useState([]);
  const [teamsData, setTeamsData] = useState([]);
  const [loading1, setLoading1] = useState(true);
  const [loading2, setLoading2] = useState(true);
  const [error1, setError1] = useState(null);
  const [error2, setError2] = useState(null);

  // Fetch matches per year data (Task 1)
  useEffect(() => {
    const fetchMatchesPerYear = async () => {
      try {
        setLoading1(true);
        setError1(null);
        const response = await apiService.getMatchesPerYear();
        if (response.success) {
          setMatchesData(response.data);
        } else {
          throw new Error(response.error || 'Failed to fetch matches data');
        }
      } catch (error) {
        setError1(error);
        console.error('Error fetching matches per year:', error);
      } finally {
        setLoading1(false);
      }
    };

    fetchMatchesPerYear();
  }, []);

  // Fetch team wins stacked data (Task 2)
  useEffect(() => {
    const fetchTeamWinsStacked = async () => {
      try {
        setLoading2(true);
        setError2(null);
        const response = await apiService.getTeamWinsStacked();
        if (response.success) {
          // Process data for stacked bar chart
          const processedData = processTeamWinsData(response.data);
          setTeamsData(processedData);
        } else {
          throw new Error(response.error || 'Failed to fetch team wins data');
        }
      } catch (error) {
        setError2(error);
        console.error('Error fetching team wins stacked:', error);
      } finally {
        setLoading2(false);
      }
    };

    fetchTeamWinsStacked();
  }, []);

  // Process team wins data for stacked chart
  const processTeamWinsData = (data) => {
    const teamsByYear = {};
    
    data.forEach(item => {
      if (!teamsByYear[item.year]) {
        teamsByYear[item.year] = {};
      }
      teamsByYear[item.year][item.team] = item.wins;
    });

    const years = Object.keys(teamsByYear).sort();
    const allTeams = [...new Set(data.map(item => item.team))];
    
    return {
      years,
      teams: allTeams,
      data: years.map(year => ({
        year,
        ...teamsByYear[year]
      }))
    };
  };

  return (
    <Container maxWidth="xl">
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <HomeIcon color="primary" sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            IPL Analytics Dashboard
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          Welcome to the comprehensive IPL data analytics platform
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explore match statistics, team performance, and player analytics from the Indian Premier League
        </Typography>
      </Box>

      {/* Charts Grid */}
      <Grid container spacing={4}>
        {/* Task 1: Matches Per Year Chart */}
        <Grid item xs={12} lg={6}>
          <ChartContainer
            title="Matches Played Per Year"
            subtitle="Total number of matches played in each IPL season"
            loading={loading1}
            error={error1}
            height={400}
          >
            {matchesData.length > 0 && (
              <BarChart
                dataset={matchesData}
                xAxis={[{
                  scaleType: 'band',
                  dataKey: 'year',
                }]}
                series={[{
                  dataKey: 'matches_count',
                  label: 'Matches',
                  color: '#1976d2',
                }]}
                width={500}
                height={350}
                margin={{ left: 50, right: 20, top: 20, bottom: 50 }}
              />
            )}
          </ChartContainer>
        </Grid>

        {/* Task 2: Team Wins Stacked Chart */}
        <Grid item xs={12} lg={6}>
          <ChartContainer
            title="Team Wins by Year"
            subtitle="Stacked view of matches won by each team across seasons"
            loading={loading2}
            error={error2}
            height={400}
          >
            {teamsData.data && teamsData.data.length > 0 && (
              <BarChart
                dataset={teamsData.data}
                xAxis={[{
                  scaleType: 'band',
                  dataKey: 'year',
                }]}
                series={teamsData.teams.slice(0, 10).map((team, index) => ({
                  dataKey: team,
                  label: team,
                  stack: 'total',
                  color: `hsl(${(index * 36) % 360}, 70%, 50%)`,
                }))}
                width={500}
                height={350}
                margin={{ left: 50, right: 20, top: 20, bottom: 50 }}
              />
            )}
          </ChartContainer>
        </Grid>
      </Grid>

      {/* Information Cards */}
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                📊 Chart 1: Matches Per Year
              </Typography>
              <Typography variant="body2">
                Shows the total number of matches played in each IPL season from 2008 onwards.
              </Typography>
            </Alert>
          </Grid>
          <Grid item xs={12} md={4}>
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                🏆 Chart 2: Team Wins Stacked
              </Typography>
              <Typography variant="body2">
                Displays a stacked bar chart showing matches won by different teams across all seasons.
              </Typography>
            </Alert>
          </Grid>
          <Grid item xs={12} md={4}>
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                🎯 Navigation
              </Typography>
              <Typography variant="body2">
                Use the navigation bar above to explore year-specific analytics for teams and players.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;
