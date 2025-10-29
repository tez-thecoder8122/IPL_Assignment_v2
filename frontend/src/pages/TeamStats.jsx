import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Alert,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import YearSelector from '../components/YearSelector';
import { apiService } from '../services/api';
import GroupsIcon from '@mui/icons-material/Groups';
import '../styles/TeamStats.css';

const TeamStats = () => {
  const [selectedYear, setSelectedYear] = useState(2017);
  const [availableYears, setAvailableYears] = useState([]);
  const [teamStatsData, setTeamStatsData] = useState([]);
  const [chartData, setChartData] = useState([]);
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

  // Fetch team stats data
  useEffect(() => {
    const fetchTeamStats = async () => {
      if (!selectedYear) return;

      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getMatchesPlayedVsWon(selectedYear);

        if (response.success && response.data && response.data.length > 0) {
          const formattedData = response.data.map((item, index) => ({
            id: index,
            rank: index + 1,
            team_name: item.team || item.team_name || 'Unknown',
            matches_played: parseInt(item.matches_played) || 0,
            matches_won: parseInt(item.matches_won) || 0,
            matches_lost: (parseInt(item.matches_played) || 0) - (parseInt(item.matches_won) || 0),
            win_percentage: parseFloat(item.win_percentage) || 0,
          }));

          const sortedData = formattedData.sort((a, b) => b.win_percentage - a.win_percentage);
          setTeamStatsData(sortedData);

          const chartFormattedData = sortedData.map((item) => ({
            team_name: (item.team_name || 'Unknown').substring(0, 15),
            matches_played: item.matches_played,
            matches_won: item.matches_won,
          }));
          setChartData(chartFormattedData);
        } else {
          setTeamStatsData([]);
          setChartData([]);
        }
      } catch (error) {
        setError(error);
        console.error('Error fetching team stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamStats();
  }, [selectedYear]);

  // Helper functions
  const getPerformanceBadge = (winPercentage) => {
    if (winPercentage >= 70) return { color: 'success', label: 'Excellent' };
    if (winPercentage >= 60) return { color: 'info', label: 'Good' };
    if (winPercentage >= 50) return { color: 'warning', label: 'Average' };
    return { color: 'error', label: 'Poor' };
  };

  const getWinPercentageColor = (winPercentage) => {
    if (winPercentage >= 60) return '#2e7d32';
    if (winPercentage >= 50) return '#ff9800';
    return '#d32f2f';
  };

  const totalMatches = teamStatsData.reduce((sum, t) => sum + t.matches_played, 0);
  const avgWinPercentage = teamStatsData.length > 0
    ? (teamStatsData.reduce((sum, t) => sum + t.win_percentage, 0) / teamStatsData.length).toFixed(1)
    : 0;

  return (
    <div className="team-stats-container">
      {/* HEADER */}
      <div className="team-stats-content team-stats-header">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <GroupsIcon color="primary" sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h4" component="h1" className="team-stats-title">
            Team Performance
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          Matches played vs matches won comparison
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Compare team performance in terms of matches played, won, and win percentage
        </Typography>
      </div>

      {/* YEAR SELECTOR */}
      <div className="year-selector-wrapper">
        <YearSelector
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          availableYears={availableYears}
          loading={loading}
        />
      </div>

      {/* STATS CARDS */}
      {!loading && teamStatsData.length > 0 && (
        <div className="team-stats-content stats-cards-container">
          <Paper className="stat-card stat-card-green">
            <Typography variant="body2" color="text.secondary">
              Total Matches
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
              {totalMatches}
            </Typography>
          </Paper>

          <Paper className="stat-card stat-card-blue">
            <Typography variant="body2" color="text.secondary">
              Total Teams
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1565c0' }}>
              {teamStatsData.length}
            </Typography>
          </Paper>

          <Paper className="stat-card stat-card-orange">
            <Typography variant="body2" color="text.secondary">
              Avg Win %
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#e65100' }}>
              {avgWinPercentage}%
            </Typography>
          </Paper>
        </div>
      )}

      {/* CHART COMPONENT - INLINE */}
      <div className="team-stats-content">
        {loading ? (
          <div className="loading-container">
            <CircularProgress />
            <Typography>Loading data for {selectedYear}...</Typography>
          </div>
        ) : error ? (
          <Alert severity="error">Failed to load team stats data: {error.message}</Alert>
        ) : chartData.length > 0 ? (
          <Box className="chart-paper">
            <div className="chart-header">
              <div className="chart-title-wrapper">
                <Typography variant="h5" className="chart-title">
                  <span className="chart-emoji">📊</span>
                  Team Performance Comparison - IPL {selectedYear}
                </Typography>
              </div>
              <Typography variant="body2" className="chart-subtitle">
                Matches played vs matches won by each team
              </Typography>
            </div>

            <div className="chart-wrapper">
              <BarChart
                dataset={chartData}
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
                  label: 'Number of Matches',
                }]}
                series={[
                  {
                    dataKey: 'matches_played',
                    label: 'Matches Played',
                    color: '#2196f3',
                  },
                  {
                    dataKey: 'matches_won',
                    label: 'Matches Won',
                    color: '#4caf50',
                  },
                ]}
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

      {/* TABLE */}
      {!loading && teamStatsData.length > 0 && (
        <div className="team-stats-content">
          <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" className="table-header" sx={{ width: '8%' }}>
                      Rank
                    </TableCell>
                    <TableCell align="left" className="table-header" sx={{ width: '30%' }}>
                      Team
                    </TableCell>
                    <TableCell align="center" className="table-header" sx={{ width: '15%' }}>
                      Matches Played
                    </TableCell>
                    <TableCell align="center" className="table-header" sx={{ width: '15%' }}>
                      Matches Won
                    </TableCell>
                    <TableCell align="center" className="table-header" sx={{ width: '12%' }}>
                      Win %
                    </TableCell>
                    <TableCell align="center" className="table-header" sx={{ width: '20%' }}>
                      Performance
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teamStatsData.map((row, index) => {
                    const badge = getPerformanceBadge(row.win_percentage);
                    return (
                      <TableRow
                        key={row.id}
                        className={`table-row-hover ${index % 2 === 0 ? 'table-row-even' : ''}`}
                      >
                        <TableCell align="center" className="table-rank-cell">
                          {row.rank}
                        </TableCell>
                        <TableCell align="left">
                          <Typography variant="body2" sx={{ fontWeight: '500' }}>
                            {row.team_name}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={row.matches_played} size="small" className="chip-blue" />
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={row.matches_won} size="small" className="chip-green" />
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            sx={{
                              fontWeight: 'bold',
                              color: getWinPercentageColor(row.win_percentage)
                            }}
                          >
                            {row.win_percentage.toFixed(1)}%
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={badge.label}
                            color={badge.color}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </div>
      )}

      {/* INFO ALERTS */}
      <div className="team-stats-content">
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
                📊 Understanding the Data
              </Typography>
              <Typography variant="body2">
                The chart shows matches played vs matches won by each team. Win percentage indicates team's success rate in the IPL season.
              </Typography>
            </Alert>
          </Grid>
          <Grid item xs={12} md={6}>
            <Alert
              severity="success"
              sx={{
                borderRadius: 2,
                border: '1px solid #4caf50',
                backgroundColor: '#f1f8e9'
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                🏆 Performance Ratings
              </Typography>
              <Typography variant="body2">
                Excellent: ≥70% | Good: 60-70% | Average: 50-60% | Poor: &lt;50%
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </div>

      {/* FOOTER */}
      <div className="team-footer">
        <Typography variant="body2">
          IPL Analytics Dashboard | Team Performance Analysis
        </Typography>
      </div>
    </div>
  );
};

export default TeamStats;
