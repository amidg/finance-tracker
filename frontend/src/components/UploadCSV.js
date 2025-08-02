import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  LinearProgress,
  Card,
  CardContent
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { uploadCSV } from '../api';

const UploadCSV = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setError('');
      setMessage('');
    } else {
      setError('Please select a valid CSV file');
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError('');
    setMessage('');

    try {
      const result = await uploadCSV(selectedFile);
      setMessage(`Success! ${result.message}`);
      setSelectedFile(null);
      // Reset file input
      document.getElementById('csv-file-input').value = '';
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload CSV file');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setError('');
      setMessage('');
    } else {
      setError('Please drop a valid CSV file');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Upload CSV File
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            CSV Format Requirements
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your CSV file should have the following columns:
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Column 1: Date (YYYY-MM-DD format)</li>
            <li>Column 2: Description</li>
            <li>Column 3: Amount Spent (positive number or 0)</li>
            <li>Column 4: Amount Received (positive number or 0)</li>
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Paper
        sx={{
          p: 4,
          border: '2px dashed #ccc',
          borderRadius: 2,
          textAlign: 'center',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover',
          },
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById('csv-file-input').click()}
      >
        <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Drop your CSV file here or click to browse
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Supports CSV files only
        </Typography>
        
        <input
          id="csv-file-input"
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </Paper>

      {selectedFile && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1">
            Selected file: <strong>{selectedFile.name}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Size: {(selectedFile.size / 1024).toFixed(2)} KB
          </Typography>
        </Box>
      )}

      {uploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Uploading and processing file...
          </Typography>
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          startIcon={<CloudUploadIcon />}
        >
          Upload CSV
        </Button>
      </Box>
    </Box>
  );
};

export default UploadCSV;