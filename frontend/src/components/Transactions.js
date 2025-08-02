import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Alert,
  Chip,
  TablePagination,
  TextField,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { getTransactions } from '../api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    // Filter transactions based on search term
    if (!searchTerm) {
      setFilteredTransactions(transactions);
    } else {
      const filtered = transactions.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.tags.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTransactions(filtered);
    }
    setPage(0); // Reset to first page when filtering
  }, [searchTerm, transactions]);

  const loadTransactions = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await getTransactions();
      setTransactions(data);
      setFilteredTransactions(data);
    } catch (err) {
      setError('Failed to load transactions');
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount) => {
    return amount > 0 ? `$${amount.toFixed(2)}` : '';
  };

  const renderTags = (tags) => {
    if (!tags) return null;
    
    return tags.split(',').map((tag, index) => (
      <Chip
        key={index}
        label={tag.trim()}
        size="small"
        sx={{ mr: 0.5, mb: 0.5 }}
        color="primary"
        variant="outlined"
      />
    ));
  };

  if (loading) {
    return <Typography>Loading transactions...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Transactions
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search transactions by description or tags..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Amount Spent</TableCell>
                <TableCell align="right">Amount Received</TableCell>
                <TableCell>Tags</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell align="right" sx={{ color: 'error.main' }}>
                      {formatAmount(transaction.amount_spent)}
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'success.main' }}>
                      {formatAmount(transaction.amount_received)}
                    </TableCell>
                    <TableCell>{renderTags(transaction.tags)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredTransactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {filteredTransactions.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm ? 'No transactions match your search' : 'No transactions found'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {!searchTerm && 'Upload a CSV file to get started'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Transactions;