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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { getKeywords, createKeyword, deleteKeyword } from '../api';

const Keywords = () => {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    loadKeywords();
  }, []);

  const loadKeywords = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await getKeywords();
      setKeywords(data);
    } catch (err) {
      setError('Failed to load keywords');
      console.error('Error loading keywords:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKeyword = async () => {
    if (!newKeyword.trim() || !newTag.trim()) {
      setError('Both keyword and tag are required');
      return;
    }

    try {
      await createKeyword(newKeyword.trim(), newTag.trim());
      setSuccess('Keyword created successfully');
      setOpen(false);
      setNewKeyword('');
      setNewTag('');
      loadKeywords();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create keyword');
    }
  };

  const handleDeleteKeyword = async (keywordId) => {
    if (!window.confirm('Are you sure you want to delete this keyword?')) {
      return;
    }

    try {
      await deleteKeyword(keywordId);
      setSuccess('Keyword deleted successfully');
      loadKeywords();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete keyword');
    }
  };

  const handleDialogClose = () => {
    setOpen(false);
    setNewKeyword('');
    setNewTag('');
    setError('');
  };

  // Group keywords by tag for better visualization
  const keywordsByTag = keywords.reduce((acc, keyword) => {
    if (!acc[keyword.tag]) {
      acc[keyword.tag] = [];
    }
    acc[keyword.tag].push(keyword);
    return acc;
  }, {});

  if (loading) {
    return <Typography>Loading keywords...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Keywords Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Add Keyword
        </Button>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Keywords are used to automatically tag transactions based on their descriptions.
        When a transaction description contains a keyword, it will be tagged accordingly.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {Object.keys(keywordsByTag).length > 0 ? (
        Object.entries(keywordsByTag).map(([tag, tagKeywords]) => (
          <Paper key={tag} sx={{ mb: 2 }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Chip label={tag} color="primary" />
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Keyword</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tagKeywords.map((keyword) => (
                    <TableRow key={keyword.id}>
                      <TableCell>{keyword.keyword}</TableCell>
                      <TableCell>
                        {new Date(keyword.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteKeyword(keyword.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ))
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No keywords configured
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add keywords to automatically tag your transactions
          </Typography>
        </Paper>
      )}

      <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Keyword</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Keyword"
            fullWidth
            variant="outlined"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="e.g., grocery, restaurant, gas"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Tag"
            fullWidth
            variant="outlined"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="e.g., Food, Transportation, Entertainment"
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            When a transaction description contains this keyword, it will be automatically tagged with the specified tag.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleCreateKeyword} variant="contained">
            Add Keyword
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Keywords;