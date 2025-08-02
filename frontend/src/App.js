import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Box, Tabs, Tab } from '@mui/material';

import Dashboard from './components/Dashboard';
import UploadCSV from './components/UploadCSV';
import Keywords from './components/Keywords';
import Transactions from './components/Transactions';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Finance Tracker
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ mt: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="finance tracker tabs">
              <Tab label="Dashboard" />
              <Tab label="Upload CSV" />
              <Tab label="Transactions" />
              <Tab label="Keywords" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <Dashboard />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <UploadCSV />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <Transactions />
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            <Keywords />
          </TabPanel>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;