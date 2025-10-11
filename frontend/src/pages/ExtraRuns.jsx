import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Container,
  Alert,
  Chip
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import ChartContainer from '../components/ChartContainer';
import YearSelector from '../components/YearSelector';
import { apiService } from '../services/api';
import SecurityIcon from '@mui/icons-material/Security';

const ExtraRuns = () => {
  const [data, setData] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('2019'); // Default year
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch available years on component mount
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await apiService.getAvailableYears();
        if (response.success) {
          setAvailableYears(response.data);
          if (response.data.length > 0 && !response.data.includes(selectedYear)) {
            setSelectedYear(response.data[response.data.length - 1]); // Set to latest year
          }
        }
      } catch (error) {
        console.error('Error fetching available years:', error);
      }
    };

    fetchYears();
  }, [selectedYear]);

  // Fetch extra runs data when year changes
  useEffect(() => {
    if (selectedYear) {
      fetchExtraRunsData(selectedYear);
    }
  }, [selectedYear]);

  const fetchExtraRunsData = async (year) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getExtraRunsPerTeam(year);
      if (response.success) {
        setData(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch extra runs data');
      }
    } catch (error) {
      setError(error);
      console.error('Error fetching extra runs data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  // Calculate statistics
  const totalExtraRuns = data.reduce((sum, item) => sum + item.extra_runs, 0);
  const avgExtraRuns = data.length > 0 ? Math.round(totalExtraRuns / data.length) : 0;
  const maxExtraRunsTeam = data.length > 0 ? data.reduce((max, team) => 
    team.extra_runs > max.extra_runs ? team : max, data[0]) : null;

  return (
    <Container maxWidth="xl">
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SecurityIcon color="primary" sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Extra Runs Analysis
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          Extra runs conceded by teams in bowling
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Analyze fielding discipline and bowling extras (wides, no-balls, byes, leg-byes) by team
        </Typography>
      </Box>

      {/* Year Selector */}
      <YearSelector
        selectedYear={selectedYear}
        onYearChange={handleYearChange}
        availableYears={availableYears}
        loading={loading}
      />

      {/* Statistics Cards */}
      {selectedYear && data.length > 0 && (
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            label={`Total Extra Runs: ${totalExtraRuns}`} 
            color="primary" 
            variant="outlined" 
            size="medium"
          />
          <Chip 
            label={`Average per Team: ${avgExtraRuns}`} 
            color="secondary" 
            variant="outlined" 
            size="medium"
          />
          {maxExtraRunsTeam && (
            <Chip 
              label={`Highest: ${maxExtraRunsTeam.team} (${maxExtraRunsTeam.extra_runs})`} 
              color="error" 
              variant="outlined" 
              size="medium"
            />
          )}
        </Box>
      )}

      {/* Chart */}
      <ChartContainer
        title={`Extra Runs Conceded by Teams - IPL ${selectedYear}`}
        subtitle="Includes wides, no-balls, byes, and leg-byes conceded while bowling"
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
              label: 'Extra Runs',
            }]}
            series={[{
              dataKey: 'extra_runs',
              label: 'Extra Runs',
              color: '#f44336',
            }]}
            width={500}
            height={450}
            margin={{ left: 60, right: 20, top: 20, bottom: 80 }}
          />
        )}
      </ChartContainer>

      {/* Information */}
      <Box sx={{ mt: 3 }}>
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            📊 About Extra Runs
          </Typography>
          <Typography variant="body2">
            Extra runs include wides, no-balls, byes, and leg-byes conceded by the bowling team. 
            Lower numbers indicate better bowling discipline and fielding standards. 
            This metric helps identify teams with strong bowling control and fielding precision.
          </Typography>
        </Alert>
      </Box>
    </Container>
  );
};

export default ExtraRuns;