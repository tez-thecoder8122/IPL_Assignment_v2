import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Alert,
  Grid,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import YearSelector from '../components/YearSelector';
import { apiService } from '../services/api';
import SchoolIcon from '@mui/icons-material/School';
import '../styles/Bowlers.css';

const Bowlers = () => {
  const [selectedYear, setSelectedYear] = useState(2010);
  const [availableYears, setAvailableYears] = useState([]);
  const [bowlersData, setBowlersData] = useState([]);
  const [topBowlers, setTopBowlers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch available years
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await apiService.getAvailableYears();
        if (response.success && response.data.length > 0) {
          setAvailableYears(response.data);
          setSelectedYear(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching years:', error);
      }
    };
    fetchYears();
  }, []);

  // Fetch bowlers data
  useEffect(() => {
    const fetchBowlersData = async () => {
      if (!selectedYear) return;

      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getEconomicalBowlers(selectedYear);

        if (response.success && response.data && response.data.length > 0) {
          const data = response.data;

          // Get top 3 bowlers with proper field mapping
          const top3 = data.slice(0, 3).map((item) => ({
            bowler: item.bowler || item.bowler_name || 'Unknown',
            economy_rate: item.economy_rate || 0,
            overs_bowled: item.overs_bowled || 0,
            runs_conceded: item.runs_conceded || 0,
            wickets_taken: item.wickets_taken || 0,
          }));
          setTopBowlers(top3);

          // Format data for chart (limit to top 10)
          const chartData = data.slice(0, 10).map((item, index) => ({
            rank: index + 1,
            bowler_name: (item.bowler || item.bowler_name || 'Unknown').substring(0, 15),
            economy_rate: parseFloat(item.economy_rate) || 0,
            overs_bowled: parseFloat(item.overs_bowled) || 0,
            runs_conceded: parseInt(item.runs_conceded) || 0,
            wickets_taken: parseInt(item.wickets_taken) || 0,
          }));

          setBowlersData(chartData);
        } else {
          setBowlersData([]);
          setTopBowlers([]);
        }
      } catch (error) {
        setError(error);
        console.error('Error fetching economical bowlers:', error);
        setBowlersData([]);
        setTopBowlers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBowlersData();
  }, [selectedYear]);

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  // Medal emojis for top 3
  const medals = ['🥇', '🥈', '🥉'];
  const cardBackgrounds = [
    'linear-gradient(135deg, #FFD700 0%, #FFC700 100%)',
    'linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%)',
    'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)'
  ];

  // Calculate stats
  const bestEconomy = bowlersData.length > 0 ? bowlersData[0]?.economy_rate.toFixed(2) : 0;
  const avgEconomy = bowlersData.length > 0
    ? (bowlersData.reduce((sum, b) => sum + b.economy_rate, 0) / bowlersData.length).toFixed(2)
    : 0;

  return (
    <div className="bowlers-container">
      {/* HEADER */}
      <div className="bowlers-content bowlers-header">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <SchoolIcon color="primary" sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h4" component="h1" className="bowlers-title">
            Economical Bowlers
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          Most economical bowlers by economy rate
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Bowlers with minimum 10 overs bowled, ranked by lowest economy rate (runs per over)
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

      {/* TOP 3 BOWLERS CARDS */}
      {!loading && topBowlers.length > 0 && (
        <div className="bowlers-content">
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Typography variant="subtitle1" className="top-bowlers-title">
              Top 3 Most Economical Bowlers
            </Typography>
          </Box>

          <div className="bowlers-cards-container">
            {topBowlers.map((bowler, index) => (
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
                    {bowler.bowler}
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ fontWeight: 'bold', marginTop: '8px', marginBottom: '8px' }}
                  >
                    {parseFloat(bowler.economy_rate).toFixed(2)}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Economy Rate
                  </Typography>
                  <Box sx={{ marginTop: '16px', textAlign: 'left', fontSize: '14px' }}>
                    <Typography variant="body2" sx={{ marginBottom: '4px' }}>
                      Overs: {bowler.overs_bowled}
                    </Typography>
                    <Typography variant="body2" sx={{ marginBottom: '4px' }}>
                      Wickets: {bowler.wickets_taken}
                    </Typography>
                    <Typography variant="body2">
                      Runs: {bowler.runs_conceded}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </div>
        </div>
      )}

      {/* CHART */}
      <div className="bowlers-content">
        {loading ? (
          <div className="loading-container">
            <CircularProgress />
            <Typography>Loading data for {selectedYear}...</Typography>
          </div>
        ) : error ? (
          <Alert severity="error">Failed to load bowlers data: {error.message}</Alert>
        ) : bowlersData.length > 0 ? (
          <Box className="chart-paper">
            <div className="chart-header">
              <div className="chart-title-wrapper">
                <Typography variant="h5" className="chart-title">
                  <span className="chart-emoji">📊</span>
                  Most Economical Bowlers - IPL {selectedYear}
                </Typography>
              </div>
              <Typography variant="body2" className="chart-subtitle">
                Bowlers ranked by economy rate (runs conceded per over bowled)
              </Typography>
            </div>

            <div className="chart-wrapper">
              <BarChart
                dataset={bowlersData}
                xAxis={[{
                  scaleType: 'band',
                  dataKey: 'bowler_name',
                  tickLabelStyle: {
                    angle: 45,
                    textAnchor: 'start',
                    fontSize: 11,
                  },
                }]}
                yAxis={[{
                  label: 'Economy Rate (Runs per Over)',
                }]}
                series={[{
                  dataKey: 'economy_rate',
                  label: 'Economy Rate',
                  color: '#2196f3',
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
      {!loading && bowlersData.length > 0 && (
        <div className="bowlers-content">
          <div className="stats-container">
            <Paper className="stat-card stat-card-green">
              <Typography variant="body2" color="text.secondary">
                Best Economy
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                {bestEconomy}
              </Typography>
            </Paper>

            <Paper className="stat-card stat-card-blue">
              <Typography variant="body2" color="text.secondary">
                Total Bowlers
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1565c0' }}>
                {bowlersData.length}
              </Typography>
            </Paper>

            <Paper className="stat-card stat-card-orange">
              <Typography variant="body2" color="text.secondary">
                Avg Economy
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#e65100' }}>
                {avgEconomy}
              </Typography>
            </Paper>
          </div>
        </div>
      )}

      {/* INFO SECTION */}
      <div className="bowlers-content">
        <Grid container spacing={2}>
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
                📈 Chart Details
              </Typography>
              <Typography variant="body2">
                Economy rate is calculated as runs conceded per over bowled. Lower economy rates indicate more economical bowling. Only bowlers with minimum 10 overs bowled are included for statistical relevance.
              </Typography>
            </Alert>
          </Grid>

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
                💡 What is Economy Rate?
              </Typography>
              <Typography variant="body2">
                Economy Rate = Total Runs Conceded ÷ Total Overs Bowled. This metric helps identify bowlers who can restrict opposition batsmen effectively.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </div>

      {/* FOOTER */}
      <div className="bowlers-footer">
        <Typography variant="body2">
          IPL Analytics Dashboard | Economical Bowlers Analysis
        </Typography>
      </div>
    </div>
  );
};

export default Bowlers;
