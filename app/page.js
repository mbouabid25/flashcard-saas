'use client';

import React from 'react';
import { Button, Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { getStripe } from '../utils/get-stripe';

const MyPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  useEffect(() => {
    if (user) {
      fetchFlashcardSets();
    }
  }, [user]);

  const fetchFlashcardSets = async () => {
    if (!user) return;

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/checkout_sessions', {
        method: 'POST',
      });
      const checkoutSessionJson = await response.json();

      const stripe = await getStripe();
      const { error } = await stripe.redirectToCheckout({
        sessionId: checkoutSessionJson.id,
      });

      if (error) {
        console.warn("Stripe Checkout Error:", error.message);
      }
    } catch (error) {
      console.error("Error during checkout:", error);
    }
  };


  const handleNextCard = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcardSets.length);
  };

  const handlePrevCard = () => {
    setCurrentCardIndex((prevIndex) =>
      prevIndex === 0 ? flashcardSets.length - 1 : prevIndex - 1
    );
  };

  const handleCheckout = async (planType, priceId = null) => {
    setLoading(true);
    try {
      const response = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType, priceId }), // Send planType and priceId to the server
      });
  
      if (!response.ok) {
        throw new Error('Failed to create Stripe checkout session');
      }
  
      const checkoutSession = await response.json();
  
      if (planType === 'free') {
        alert(checkoutSession.message); // Handle free plan separately if needed
        setLoading(false); // Reset loading state after alert
      } else {
        const stripe = await getStripe();
        const { error } = await stripe.redirectToCheckout({ sessionId: checkoutSession.id });
  
        if (error) {
          console.error('Stripe Checkout Error:', error.message);
        }
      }
    } catch (error) {
      console.error('Error during checkout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={styles.container}
      style={{
        background: 'linear-gradient(135deg, #00F260 0%, #0575E6 50%, #7F00FF 100%)',
        minHeight: '100vh',
        color: '#fff',
        padding: '20px',
      }}
    >
      <Box sx={{ textAlign: 'center', my: 4, padding: '50px', borderRadius: '12px', color: '#fff' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Flashcard SaaS
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          The easiest way to create flashcards from your text.
        </Typography>
        <Button
          variant="contained"
          sx={{
            mt: 2,
            mr: 2,
            backgroundColor: '#32CD32', // Vibrant green color
            '&:hover': { backgroundColor: '#2eb82e' }, // Darker green on hover
          }}
          onClick={() => router.push('/generate')}
        >
          Get Started
        </Button>
        <Button
          variant="contained" // Changed from outlined to contained
          sx={{
            mt: 2,
            backgroundColor: '#32CD32', // Matching green color
            '&:hover': { backgroundColor: '#2eb82e' }, // Darker green on hover
          }}
          onClick={() => router.push('/learn-more')}
        >
          Learn More
        </Button>
      </Box>

      <Box sx={{ my: 6, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Features
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                textAlign: 'center',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                transition: '0.3s',
                '&:hover': { transform: 'translateY(-10px)' },
                backgroundColor: '#1e1e1e',
                color: '#fff',
              }}
            >
              <CardContent>
                <Typography variant="h5" component="h3">
                  Easy to Use
                </Typography>
                <Typography>
                  Our platform is designed with simplicity in mind, so you can focus on learning.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          {/* Repeat for other features */}
        </Grid>
      </Box>

      <Box sx={{ my: 6, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Pricing
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                textAlign: 'center',
                border: '2px solid #00F260',
                borderRadius: '12px',
                backgroundColor: '#1e1e1e',
                color: '#fff',
              }}
            >
              <CardContent>
                <Typography variant="h5" component="h3">
                  One-Time Purchase
                </Typography>
                <Typography variant="h6" color="textSecondary" sx={{ color: '#00F260' }}>
                  $1
                </Typography>
                <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSubmit}>
                  Buy Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default MyPage;




