import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert
} from '@mui/material';
import { PieChart, BarChart } from '@mui/x-charts';
import { getMonthlyChartData, getYearlyChartData, getAllTimeChartData } from '../api';
import eventBus, { EVENTS } from '../services/eventBus';

const Dashboard = () => {
  const [chartData, setChartData] = useState(null);
  const [viewType, setViewType] = useState('all-time');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadChartData();
  }, [viewType, selectedYear, selectedMonth]);

  // Listen for keyword updates
  useEffect(() => {
    const unsubscribe = eventBus.on(EVENTS.KEYWORDS_UPDATED, () => {
      // Reload chart data when keywords are updated
      loadChartData();
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);

  const loadChartData = async () => {
    setLoading(true);
    setError('');
    
    try {
      let data;
      if (viewType === 'monthly') {
        data = await getMonthlyChartData(selectedYear, selectedMonth);
      } else if (viewType === 'yearly') {
        data = await getYearlyChartData(selectedYear);
      } else {
        data = await getAllTimeChartData();
      }
      setChartData(data);
    } catch (err) {
      setError('Failed to load chart data');
      console.error('Error loading chart data:', err);
    } finally {
      setLoading(false);
    }
  };

  const preparePieData = () => {
    if (!chartData || !chartData.tag_data) return [];
    
    return Object.entries(chartData.tag_data).map(([tag, amount], index) => ({
      id: index,
      label: tag || 'Untagged',
      value: amount,
    }));
  };

  const prepareBarData = () => {
    if (!chartData) return { categories: [], spending: [], income: [] };
    
    return {
      categories: chartData.labels || [],
      spending: chartData.spending_data || [],
      income: chartData.income_data || [],
    };
  };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const pieData = preparePieData();
  const barData = prepareBarData();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>View Type</InputLabel>
            <Select
              value={viewType}
              label="View Type"
              onChange={(e) => setViewType(e.target.value)}
            >
              <MenuItem value="all-time">All Time</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {(viewType === 'yearly' || viewType === 'monthly') && (
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                value={selectedYear}
                label="Year"
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {viewType === 'monthly' && (
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Month</InputLabel>
              <Select
                value={selectedMonth}
                label="Month"
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {months.map((month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Spending by Category
            </Typography>
            {pieData.length > 0 ? (
              <PieChart
                series={[{ data: pieData }]}
                width={400}
                height={300}
              />
            ) : (
              <Typography>No data available</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Spending vs Income Over Time
            </Typography>
            {barData.categories.length > 0 ? (
              <BarChart
                xAxis={[{ 
                  scaleType: 'band', 
                  data: barData.categories,
                  tickLabelStyle: { fontSize: 10 }
                }]}
                series={[
                  { data: barData.spending, label: 'Spending', color: '#f44336' },
                  { data: barData.income, label: 'Income', color: '#4caf50' },
                ]}
                width={400}
                height={300}
              />
            ) : (
              <Typography>No data available</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;