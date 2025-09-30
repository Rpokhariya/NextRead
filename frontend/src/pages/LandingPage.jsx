import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import Header from '../components/Header';
import BookCard from '../components/BookCard';
import { booksAPI } from '../services/api';

const LandingPage = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      navigate('/dashboard');
      return;
    }

    fetchPopularBooks();
  }, [navigate]);

  const fetchPopularBooks = async () => {
    try {
      setLoading(true);
      const response = await booksAPI.getPopularBooks();
      setBooks(response.data);
    } catch (err) {
      setError('Failed to load popular books. Please try again later.');
      console.error('Error fetching popular books:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header isLoggedIn={false} />
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            p: 6,
            mb: 6,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 2,
          }}
        >
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            What to read next? Find Out!
          </Typography>
          <Typography variant="h5" sx={{ mt: 2, opacity: 0.95 }}>
            Discover your next favorite book with personalized recommendations
          </Typography>
        </Paper>

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Popular Books
        </Typography>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <Grid container spacing={3} sx={{ pb: 6 }}>
            {books.map((book) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                <BookCard book={book} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default LandingPage;