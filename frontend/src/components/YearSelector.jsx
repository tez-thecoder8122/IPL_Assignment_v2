import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box, Typography } from '@mui/material';
import DateRangeIcon from '@mui/icons-material/DateRange';

const YearSelector = ({ selectedYear, onYearChange, availableYears, loading = false }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
      <DateRangeIcon color="primary" />
      <FormControl variant="outlined" sx={{ minWidth: 120 }}>
        <InputLabel id="year-select-label">Select Year</InputLabel>
        <Select
          labelId="year-select-label"
          id="year-select"
          value={selectedYear}
          label="Select Year"
          onChange={(e) => onYearChange(e.target.value)}
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        >
          {availableYears.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {selectedYear && (
        <Typography variant="body2" color="text.secondary">
          Showing data for IPL {selectedYear}
        </Typography>
      )}
    </Box>
  );
};

export default YearSelector;