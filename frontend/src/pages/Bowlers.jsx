import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Container,
  Alert,
  Chip,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import ChartContainer from '../components/ChartContainer';
import YearSelector from '../components/YearSelector';
import { apiService } from '../services/api';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';

const Bowlers = () => {
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

  // Fetch bowlers data when year changes
  useEffect(() => {
    if (selectedYear) {
      fetchBowlersData(selectedYear);
    }
  }, [selectedYear]);

  const fetchBowlersData = async (year) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getEconomicalBowlers(year);
      if (response.success) {
        setData(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch bowlers data');
      }
    } catch (error) {
      setError(error);
      console.error('Error fetching bowlers data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  // Get top 3 bowlers for highlight
  const top3Bowlers = data.slice(0, 3);

  return (
    <Container maxWidth="xl">
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SportsCricketIcon color="primary" sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Economical Bowlers
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          Most economical bowlers by economy rate
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bowlers with minimum 10 overs bowled, ranked by lowest economy rate (runs per over)
        </Typography>
      </Box>

      {/* Year Selector */}
      <YearSelector
        selectedYear={selectedYear}
        onYearChange={handleYearChange}
        availableYears={availableYears}
        loading={loading}
      />

      {/* Top 3 Bowlers Cards */}
      {data.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            🏆 Top 3 Most Economical Bowlers - {selectedYear}
          </Typography>
          <Grid container spacing={2}>
            {top3Bowlers.map((bowler, index) => (
              <Grid item xs={12} md={4} key={bowler.bowler}>
                <Card 
                  elevation={3} 
                  sx={{ 
                    borderRadius: 3,
                    background: index === 0 ? 'linear-gradient(45deg, #FFD700 30%, #FFA500 90%)' :
                               index === 1 ? 'linear-gradient(45deg, #C0C0C0 30%, #A9A9A9 90%)' :
                               'linear-gradient(45deg, #CD7F32 30%, #B8860B 90%)',
                    color: 'white'
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} #{index + 1}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {bowler.bowler}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Economy Rate:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {bowler.economy_rate}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Overs:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {bowler.overs_bowled}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Wickets:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {bowler.wickets_taken}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Chart */}
      <ChartContainer
        title={`Most Economical Bowlers - IPL ${selectedYear}`}
        subtitle="Bowlers ranked by economy rate (runs conceded per over)"
        loading={loading}
        error={error}
        height={500}
      >
        {data.length > 0 && (
          <BarChart
            dataset={data}
            xAxis={[{
              scaleType: 'band',
              dataKey: 'bowler',
              tickLabelStyle: {
                angle: -45,
                textAnchor: 'end',
              },
            }]}
            yAxis={[{
              label: 'Economy Rate',
            }]}
            series={[{
              dataKey: 'economy_rate',
              label: 'Economy Rate',
              color: '#4caf50',
            }]}
            width={500}
            height={450}
            margin={{ left: 60, right: 20, top: 20, bottom: 100, }}
          />
        )}
      </ChartContainer>

      {/* Statistics */}
      {data.length > 0 && (
        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            label={`Best Economy: ${data[0]?.economy_rate || 'N/A'}`} 
            color="success" 
            variant="outlined" 
          />
          <Chip 
            label={`Total Bowlers: ${data.length}`} 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            label={`Avg Economy: ${data.length > 0 ? (data.reduce((sum, b) => sum + parseFloat(b.economy_rate), 0) / data.length).toFixed(2) : 'N/A'}`} 
            color="primary" 
            variant="outlined" 
          />
        </Box>
      )}

      {/* Information */}
      <Box sx={{ mt: 3 }}>
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            🎯 About Economy Rate
          </Typography>
          <Typography variant="body2">
            Economy rate is calculated as runs conceded per over bowled. 
            Lower economy rates indicate more economical bowling. 
            Only bowlers with minimum 10 overs (60 balls) in the season are included to ensure statistical relevance.
          </Typography>
        </Alert>
      </Box>
    </Container>
  );
};

export default Bowlers;