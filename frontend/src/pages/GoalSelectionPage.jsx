import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Header from '../components/Header';
import { goalsAPI } from '../services/api';

const GoalSelectionPage = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchGoals();
  }, [navigate]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await goalsAPI.getAllGoals();
      setGoals(response.data);
    } catch (err) {
      setError('Failed to load goals. Please try again later.');
      console.error('Error fetching goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalToggle = (goalId) => {
    setSelectedGoals((prev) => {
      if (prev.includes(goalId)) {
        return prev.filter((id) => id !== goalId);
      } else {
        return [...prev, goalId];
      }
    });
    setError('');
  };

  const handleSubmit = async () => {
    if (selectedGoals.length < 3) {
      setError('Please select at least 3 goals to continue');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      for (const goalId of selectedGoals) {
        await goalsAPI.setUserGoal(goalId);
      }

      navigate('/dashboard');
    } catch (err) {
      setError('Failed to save your goals. Please try again.');
      console.error('Error saving goals:', err);
    } finally {
      setSubmitting(false);
    }
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header isLoggedIn={true} />
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Select Your Reading Goals
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Choose at least 3 goals to get personalized book recommendations
          </Typography>
          <Chip
            label={`${selectedGoals.length} / ${goals.length} selected`}
            color={selectedGoals.length >= 3 ? 'success' : 'default'}
            sx={{ mt: 2 }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {goals.map((goal) => {
            const isSelected = selectedGoals.includes(goal.id);
            return (
              <Grid item xs={12} sm={6} md={4} key={goal.id}>
                <Card
                  sx={{
                    height: '100%',
                    border: isSelected ? 2 : 0,
                    borderColor: 'primary.main',
                    position: 'relative',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardActionArea onClick={() => handleGoalToggle(goal.id)} sx={{ height: '100%' }}>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      {isSelected && (
                        <CheckCircleIcon
                          color="primary"
                          sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            fontSize: 30,
                          }}
                        />
                      )}
                      <Typography variant="h5" component="h3">
                        {goal.name}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center', pb: 6 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={selectedGoals.length < 3 || submitting}
            sx={{ minWidth: 200 }}
          >
            {submitting ? <CircularProgress size={24} /> : 'Continue to Dashboard'}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default GoalSelectionPage;