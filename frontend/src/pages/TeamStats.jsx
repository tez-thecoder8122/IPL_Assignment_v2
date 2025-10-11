import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Container,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import ChartContainer from '../components/ChartContainer';
import YearSelector from '../components/YearSelector';
import { apiService } from '../services/api';
import GroupsIcon from '@mui/icons-material/Groups';

const TeamStats = () => {
  const [data, setData] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('2019');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch available years
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await apiService.getAvailableYears();
        if (response.success) {
          setAvailableYears(response.data);
          if (response.data.length > 0 && !response.data.includes(selectedYear)) {
            setSelectedYear(response.data[response.data.length - 1]);
          }
        }
      } catch (error) {
        console.error('Error fetching available years:', error);
      }
    };

    fetchYears();
  }, [selectedYear]);

  // Fetch team stats when year changes
  useEffect(() => {
    if (selectedYear) {
      fetchTeamStatsData(selectedYear);
    }
  }, [selectedYear]);

  const fetchTeamStatsData = async (year) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getMatchesPlayedVsWon(year);
      if (response.success) {
        setData(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch team stats data');
      }
    } catch (error) {
      setError(error);
      console.error('Error fetching team stats data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  // Calculate totals
  const totalMatches = data.reduce((sum, team) => sum + team.matches_played, 0);
  const avgWinPercentage = data.length > 0 ? 
    (data.reduce((sum, team) => sum + team.win_percentage, 0) / data.length).toFixed(1) : 0;

  return (
    <Container maxWidth="xl">
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <GroupsIcon color="primary" sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Team Performance
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          Matches played vs matches won comparison
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Compare team performance in terms of matches played, won, and win percentage
        </Typography>
      </Box>

      {/* Year Selector */}
      <YearSelector
        selectedYear={selectedYear}
        onYearChange={handleYearChange}
        availableYears={availableYears}
        loading={loading}
      />

      {/* Statistics */}
      {data.length > 0 && (
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            label={`Total Matches: ${totalMatches}`} 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            label={`Teams: ${data.length}`} 
            color="secondary" 
            variant="outlined" 
          />
          {/* <Chip 
            label={`Avg Win %: ${avgWinPercentage}%`} 
            color="success" 
            variant="outlined" 
          /> */}
        </Box>
      )}

      {/* Chart */}
      <ChartContainer
        title={`Team Performance Comparison - IPL ${selectedYear}`}
        subtitle="Matches played vs matches won by each team"
        loading={loading}
        error={error}
        height={500}
      >
        {data.length > 0 && (
          <BarChart
            dataset={data}
            xAxis={[{
              scaleType: 'band',
              dataKey: 'team',
              tickLabelStyle: {
                angle: -45,
                textAnchor: 'end',
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
            width={500}
            height={450}
            margin={{ left: 60, right: 20, top: 20, bottom: 80 }}
          />
        )}
      </ChartContainer>

      {/* Detailed Table */}
      {data.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            📊 Detailed Team Statistics - {selectedYear}
          </Typography>
          <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rank</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Team</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Matches Played</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Matches Won</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Win %</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Performance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((team, index) => (
                  <TableRow 
                    key={team.team}
                    sx={{ 
                      '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                      '&:hover': { backgroundColor: 'action.selected' }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {index + 1}
                      {index === 0 && ' 🏆'}
                      {index === 1 && ' 🥈'}
                      {index === 2 && ' 🥉'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{team.team}</TableCell>
                    <TableCell align="center">{team.matches_played}</TableCell>
                    <TableCell align="center">{team.matches_won}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      {team.win_percentage}%
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={
                          team.win_percentage >= 70 ? 'Excellent' :
                          team.win_percentage >= 50 ? 'Good' :
                          team.win_percentage >= 30 ? 'Average' : 'Poor'
                        }
                        color={
                          team.win_percentage >= 70 ? 'success' :
                          team.win_percentage >= 50 ? 'primary' :
                          team.win_percentage >= 30 ? 'warning' : 'error'
                        }
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Information */}
      <Box sx={{ mt: 3 }}>
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            📈 About Win Percentage
          </Typography>
          <Typography variant="body2">
            Win percentage is calculated as (Matches Won / Matches Played) × 100. 
            Teams with higher win percentages show better performance in the season. 
            The chart compares the total matches played versus matches won for each team.
          </Typography>
        </Alert>
      </Box>
    </Container>
  );
};

export default TeamStats;