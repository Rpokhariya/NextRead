import { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Rating,
  Box,
  Collapse,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';
import { booksAPI } from '../services/api';

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const BookCard = ({ book, onRatingUpdate, showRatingButton = false }) => {
  const [expanded, setExpanded] = useState(false);
  const [openRatingDialog, setOpenRatingDialog] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingError, setRatingError] = useState('');
  const [ratingSuccess, setRatingSuccess] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleRatingClick = () => {
    setOpenRatingDialog(true);
    setRatingError('');
    setRatingSuccess(false);
  };

  const handleRatingSubmit = async () => {
    if (userRating === 0) {
      setRatingError('Please select a rating');
      return;
    }

    try {
      await booksAPI.rateBook(book.id, userRating);
      setRatingSuccess(true);
      setTimeout(() => {
        setOpenRatingDialog(false);
        if (onRatingUpdate) {
          onRatingUpdate();
        }
      }, 1500);
    } catch (error) {
      setRatingError(error.response?.data?.detail || 'Failed to submit rating');
    }
  };

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6,
          },
        }}
      >
        <CardMedia
          component="img"
          height="300"
          image={book.cover_image_url || 'https://via.placeholder.com/200x300?text=No+Cover'}
          alt={book.title}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography gutterBottom variant="h6" component="h2" noWrap>
            {book.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {book.author || 'Unknown Author'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Rating value={book.average_rating || 0} precision={0.1} readOnly size="small" />
            <Typography variant="body2" color="text.secondary">
              {book.average_rating ? book.average_rating.toFixed(1) : 'N/A'}
            </Typography>
          </Box>

          <Typography variant="caption" color="text.secondary" gutterBottom>
            {book.ratings_count || 0} ratings
          </Typography>

          {showRatingButton && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleRatingClick}
              sx={{ mt: 1, mb: 1 }}
            >
              Rate This Book
            </Button>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
            <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
              {expanded ? 'Hide' : 'Show'} Description
            </Typography>
            <ExpandMore
              expand={expanded}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </ExpandMore>
          </Box>
        </CardContent>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent sx={{ pt: 0 }}>
            <Typography variant="body2" color="text.secondary">
              {book.description || 'No description available.'}
            </Typography>
          </CardContent>
        </Collapse>
      </Card>

      <Dialog open={openRatingDialog} onClose={() => setOpenRatingDialog(false)}>
        <DialogTitle>Rate "{book.title}"</DialogTitle>
        <DialogContent>
          {ratingError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {ratingError}
            </Alert>
          )}
          {ratingSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Rating submitted successfully!
            </Alert>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Rating
              value={userRating}
              onChange={(event, newValue) => {
                setUserRating(newValue);
                setRatingError('');
              }}
              size="large"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRatingDialog(false)}>Cancel</Button>
          <Button onClick={handleRatingSubmit} variant="contained" disabled={ratingSuccess}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BookCard;