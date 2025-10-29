import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Alert,
  Grid,
  CircularProgress
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import YearSelector from '../components/YearSelector';
import { apiService } from '../services/api';
import StorageIcon from '@mui/icons-material/Storage';
import '../styles/ExtraRuns.css';

const ExtraRuns = () => {
  const [selectedYear, setSelectedYear] = useState(2017);
  const [availableYears, setAvailableYears] = useState([]);
  const [extraRunsData, setExtraRunsData] = useState([]);
  const [topTeams, setTopTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch available years
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await apiService.getAvailableYears();
        if (response.success && response.data.length > 0) {
          setAvailableYears(response.data);
          setSelectedYear(response.data[response.data.length - 1]);
        }
      } catch (error) {
        console.error('Error fetching years:', error);
      }
    };
    fetchYears();
  }, []);

  // Fetch extra runs data
  useEffect(() => {
    const fetchExtraRunsData = async () => {
      if (!selectedYear) return;

      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getExtraRunsPerTeam(selectedYear);

        if (response.success && response.data && response.data.length > 0) {
          const data = response.data;

          // Sort by extra_runs in descending order
          const sortedData = data.sort((a, b) => b.extra_runs - a.extra_runs);

          // Get top 3 teams
          const top3 = sortedData.slice(0, 3).map((item) => ({
            team: item.team || item.team_name || 'Unknown',
            extra_runs: item.extra_runs || 0,
            wickets: item.wickets || 0,
            no_balls: item.no_balls || 0,
            byes: item.byes || 0,
          }));
          setTopTeams(top3);

          // Format data for chart
          const chartData = sortedData.map((item, index) => ({
            id: index,
            team_name: (item.team || item.team_name || 'Unknown').substring(0, 20),
            extra_runs: parseInt(item.extra_runs) || 0,
            wickets: parseInt(item.wickets) || 0,
            no_balls: parseInt(item.no_balls) || 0,
            byes: parseInt(item.byes) || 0,
          }));

          setExtraRunsData(chartData);
        } else {
          setExtraRunsData([]);
          setTopTeams([]);
        }
      } catch (error) {
        setError(error);
        console.error('Error fetching extra runs data:', error);
        setExtraRunsData([]);
        setTopTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExtraRunsData();
  }, [selectedYear]);

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  // Medal emojis and colors for top 3
  const medals = ['🥇', '🥈', '🥉'];
  const cardBackgrounds = [
    'linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)',
    'linear-gradient(135deg, #FFA726 0%, #FF9800 100%)',
    'linear-gradient(135deg, #AB47BC 0%, #9C27B0 100%)'
  ];

  // Calculate stats
  const maxExtraRuns = extraRunsData.length > 0 ? extraRunsData[0]?.extra_runs : 0;
  const avgExtraRuns = extraRunsData.length > 0
    ? (extraRunsData.reduce((sum, t) => sum + t.extra_runs, 0) / extraRunsData.length).toFixed(0)
    : 0;

  return (
    <div className="extra-runs-container">
      {/* HEADER */}
      <div className="extra-runs-content extra-runs-header">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <StorageIcon color="primary" sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h4" component="h1" className="extra-runs-title">
            Extra Runs Analysis
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          Extra runs conceded by teams in bowling
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Analyze fielding discipline and bowling extras including wides, no-balls, byes, and leg-byes by team
        </Typography>
      </div>

      {/* YEAR SELECTOR */}
      <div className="year-selector-wrapper">
        <YearSelector
          selectedYear={selectedYear}
          onYearChange={handleYearChange}
          availableYears={availableYears}
          loading={loading}
        />
      </div>

      {/* TOP 3 TEAMS CARDS */}
      {!loading && topTeams.length > 0 && (
        <div className="extra-runs-content">
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Typography variant="subtitle1" className="top-teams-title">
              Top 3 Teams with Most Extra Runs
            </Typography>
          </Box>

          <div className="teams-cards-container">
            {topTeams.map((team, index) => (
              <Box
                key={index}
                sx={{
                  width: 200,
                  background: cardBackgrounds[index],
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
                  }
                }}
              >
                <Box
                  sx={{
                    textAlign: 'center',
                    color: 'white',
                    padding: '24px 16px'
                  }}
                >
                  <Box sx={{ fontSize: '40px', marginBottom: '8px' }}>
                    {medals[index]}
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ fontWeight: 'bold', marginBottom: '8px' }}
                  >
                    #{index + 1}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ fontWeight: 'bold', marginBottom: '4px', wordWrap: 'break-word' }}
                  >
                    {team.team}
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ fontWeight: 'bold', marginTop: '8px', marginBottom: '8px' }}
                  >
                    {team.extra_runs.toFixed(0)}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Extra Runs
                  </Typography>
                  <Box sx={{ marginTop: '16px', textAlign: 'left', fontSize: '14px' }}>
                    <Typography variant="body2" sx={{ marginBottom: '4px' }}>
                      Wides: {team.wickets}
                    </Typography>
                    <Typography variant="body2" sx={{ marginBottom: '4px' }}>
                      No-Balls: {team.no_balls}
                    </Typography>
                    <Typography variant="body2">
                      Byes: {team.byes}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </div>
        </div>
      )}

      {/* CHART */}
      <div className="extra-runs-content">
        {loading ? (
          <div className="loading-container">
            <CircularProgress />
            <Typography>Loading data for {selectedYear}...</Typography>
          </div>
        ) : error ? (
          <Alert severity="error">Failed to load extra runs data: {error.message}</Alert>
        ) : extraRunsData.length > 0 ? (
          <Box className="chart-paper">
            <div className="chart-header">
              <div className="chart-title-wrapper">
                <Typography variant="h5" className="chart-title">
                  <span className="chart-emoji">📊</span>
                  Extra Runs Conceded by Teams - IPL {selectedYear}
                </Typography>
              </div>
              <Typography variant="body2" className="chart-subtitle">
                Wickets, wides, no-balls, and leg-byes conceded together make up the total extra runs. Lower numbers indicate better bowling discipline.
              </Typography>
            </div>

            <div className="chart-wrapper">
              <BarChart
                dataset={extraRunsData}
                xAxis={[{
                  scaleType: 'band',
                  dataKey: 'team_name',
                  tickLabelStyle: {
                    angle: 45,
                    textAnchor: 'start',
                    fontSize: 11,
                  },
                }]}
                yAxis={[{
                  label: 'Extra Runs',
                }]}
                series={[{
                  dataKey: 'extra_runs',
                  label: 'Extra Runs',
                  color: '#FF6B6B',
                }]}
                width={950}
                height={450}
                margin={{ left: 70, right: 40, top: 50, bottom: 100 }}
                slotProps={{
                  legend: {
                    direction: 'row',
                    position: { vertical: 'top', horizontal: 'middle' },
                    padding: 0,
                  },
                }}
              />
            </div>
          </Box>
        ) : (
          <Alert severity="info">No data available for the selected year</Alert>
        )}
      </div>

      {/* STATS SECTION */}
      {!loading && extraRunsData.length > 0 && (
        <div className="extra-runs-content">
          <div className="stats-container">
            <Paper className="stat-card stat-card-red">
              <Typography variant="body2" color="text.secondary">
                Max Extra Runs
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#c62828' }}>
                {maxExtraRuns}
              </Typography>
            </Paper>

            <Paper className="stat-card stat-card-blue">
              <Typography variant="body2" color="text.secondary">
                Total Teams
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1565c0' }}>
                {extraRunsData.length}
              </Typography>
            </Paper>

            <Paper className="stat-card stat-card-orange">
              <Typography variant="body2" color="text.secondary">
                Avg Extra Runs
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#e65100' }}>
                {avgExtraRuns}
              </Typography>
            </Paper>
          </div>
        </div>
      )}

      {/* INFO SECTION */}
      <div className="extra-runs-content">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Alert
              severity="info"
              sx={{
                borderRadius: 2,
                border: '1px solid #2196f3',
                backgroundColor: '#e3f2fd'
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                📊 What are Extra Runs?
              </Typography>
              <Typography variant="body2">
                Extra runs include wides, no-balls, byes, and leg-byes. These are runs scored by the batting team without hitting the ball. Higher extra runs indicate poor bowling discipline and fielding.
              </Typography>
            </Alert>
          </Grid>

          <Grid item xs={12} md={6}>
            <Alert
              severity="warning"
              sx={{
                borderRadius: 2,
                border: '1px solid #ff9800',
                backgroundColor: '#fff3e0'
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                💡 Why Does It Matter?
              </Typography>
              <Typography variant="body2">
                Teams that concede fewer extra runs tend to have better control and discipline in bowling. These "free" runs can decide close matches, making bowling accuracy crucial for success.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </div>

      {/* FOOTER */}
      <div className="extra-runs-footer">
        <Typography variant="body2">
          IPL Analytics Dashboard | Extra Runs Analysis
        </Typography>
      </div>
    </div>
  );
};

export default ExtraRuns;
