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
  Button,
  Divider,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Header from '../components/Header';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';
import { booksAPI } from '../services/api';

const motivationalQuotes = [
  "A reader lives a thousand lives before he dies. The man who never reads lives only one.",
  "Reading is to the mind what exercise is to the body.",
  "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
  "Books are a uniquely portable magic.",
  "There is no friend as loyal as a book.",
];

const UserDashboard = () => {
  const navigate = useNavigate();
  const [popularBooks, setPopularBooks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchError, setSearchError] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [randomQuote] = useState(
    motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
  );

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [popularResponse, recommendationsResponse] = await Promise.all([
        booksAPI.getPopularBooks(),
        booksAPI.getRecommendations(),
      ]);

      setPopularBooks(popularResponse.data);
      setRecommendations(recommendationsResponse.data);
    } catch (err) {
      setError('Failed to load dashboard data. Please try refreshing the page.');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setIsSearchMode(false);
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError('');
      setIsSearchMode(true);

      const response = await booksAPI.searchBooks(query);
      setSearchResults(response.data);

      if (response.data.length === 0) {
        setSearchError('No books found matching your search.');
      }
    } catch (err) {
      setSearchError('Failed to search books. Please try again.');
      console.error('Error searching books:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRatingUpdate = () => {
    fetchDashboardData();
  };

  const handleUpdateGoals = () => {
    navigate('/goals');
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Header isLoggedIn={true} />
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <Header isLoggedIn={true} />
      <Container maxWidth="lg">
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Your Reading Dashboard
          </Typography>
          <Button variant="outlined" onClick={handleUpdateGoals}>
            Update Goals
          </Button>
        </Box>

        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center',
          }}
        >
          <EmojiEventsIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h6" fontStyle="italic">
            "{randomQuote}"
          </Typography>
        </Paper>

        <SearchBar onSearch={handleSearch} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {isSearchMode ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ flexGrow: 1 }}>
                Search Results
              </Typography>
              <Button onClick={() => setIsSearchMode(false)}>Clear Search</Button>
            </Box>

            {searchLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {searchError && (
              <Alert severity="info" sx={{ mb: 3 }}>
                {searchError}
              </Alert>
            )}

            {!searchLoading && !searchError && (
              <Grid container spacing={3} sx={{ mb: 6 }}>
                {searchResults.map((book) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                    <BookCard book={book} showRatingButton onRatingUpdate={handleRatingUpdate} />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        ) : (
          <>
            {recommendations.length > 0 && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <AutoAwesomeIcon color="primary" />
                  <Typography variant="h5">Recommended For You</Typography>
                </Box>
                <Grid container spacing={3} sx={{ mb: 6 }}>
                  {recommendations.map((book) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                      <BookCard book={book} showRatingButton onRatingUpdate={handleRatingUpdate} />
                    </Grid>
                  ))}
                </Grid>
                <Divider sx={{ mb: 4 }} />
              </>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <TrendingUpIcon color="primary" />
              <Typography variant="h5">Popular Books</Typography>
            </Box>
            <Grid container spacing={3}>
              {popularBooks.map((book) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                  <BookCard book={book} showRatingButton onRatingUpdate={handleRatingUpdate} />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
};

export default UserDashboard;