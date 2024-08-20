'use client';

import React, { useEffect, useState } from 'react';
import { Button, Box, Typography, IconButton, Grid } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/clerk-react';
import { doc, getDoc } from 'firebase/firestore';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import db from './firebase';
import getStripe from '../utils/get-stripe';
import styles from './page.module.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

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

    try {
      const docRef = doc(db, 'users', user.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const sets = docSnap.data().flashcardSets || [];
        setFlashcardSets(sets);
      } else {
        console.log('No flashcard sets found.');
      }
    } catch (error) {
      console.error('Error fetching flashcard sets:', error);
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
    <div className={styles.container}>
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Flashcard SaaS
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          The easiest way to create flashcards from your text.
        </Typography>
        <Button variant="contained" color="primary" sx={{ mt: 2, mr: 2 }} onClick={() => router.push('/generate')}>
          Get Started
        </Button>
      </Box>

      <Box sx={{ my: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {flashcardSets.length > 0 && (
          <IconButton onClick={handlePrevCard} disabled={flashcardSets.length <= 1}>
            <ArrowBackIosIcon />
          </IconButton>
        )}
        {flashcardSets.length > 0 && (
          <Box
            sx={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: '#ffffffdd',
              width: '350px',
              height: '200px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              {flashcardSets[currentCardIndex].name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {flashcardSets[currentCardIndex].prompt.slice(0, 100)}...
            </Typography>
          </Box>
        )}
        {flashcardSets.length > 0 && (
          <IconButton onClick={handleNextCard} disabled={flashcardSets.length <= 1}>
            <ArrowForwardIosIcon />
          </IconButton>
        )}
      </Box>

      {flashcardSets.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 4 }}>
          {flashcardSets.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: '10px',
                height: '10px',
                backgroundColor: index === currentCardIndex ? '#007BFF' : '#CCCCCC',
                borderRadius: '50%',
                margin: '0 5px',
              }}
            />
          ))}
        </Box>
      )}

      {flashcardSets.length > 0 && (
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Button
            variant="outlined"
            sx={{
              mt: 2,
              display: 'block',
              margin: '0 auto',
              borderColor: '#007BFF',
              color: '#007BFF',
              '&:hover': {
                backgroundColor: '#007BFF',
                color: '#FFFFFF',
              },
            }}
            onClick={() => router.push('/flashcards')}
          >
            See More
          </Button>
        </Box>
      )}

      {/* Pricing Section */}
      <Box sx={{ my: 6, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Pricing
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {/* Basic Plan */}
          <Grid item xs={12} sm={6} md={4}>
            <Box
              sx={{
                border: '1px solid #CCCCCC',
                borderRadius: '12px',
                padding: '24px',
                backgroundColor: '#F8F9FA',
              }}
            >
              <Typography variant="h5" gutterBottom>
                Basic Plan
              </Typography>
              <Typography
                variant="body2"
                gutterBottom
                sx={{ color: '#7D7D7D', fontSize: '0.875rem' }}
              >
                Limited plan. Generate up to 10 sets.
              </Typography>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                $0/month
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{
                  backgroundColor: '#007BFF',
                  '&:hover': {
                    backgroundColor: '#0056b3',
                  },
                }}
                onClick={() => handleCheckout('free')}
              >
                Choose Free Plan
              </Button>
            </Box>
          </Grid>

          {/* Pro Plan */}
          <Grid item xs={12} sm={6} md={4}>
            <Box
              sx={{
                border: '1px solid #CCCCCC',
                borderRadius: '12px',
                padding: '24px',
                backgroundColor: '#F8F9FA',
              }}
            >
              <Typography variant="h5" gutterBottom>
                Pro Plan
              </Typography>
              <Typography
                variant="body2"
                gutterBottom
                sx={{ color: '#7D7D7D', fontSize: '0.875rem' }}
              >
                Unlimited plan. The options are endless!
              </Typography>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                $1/month
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{
                  backgroundColor: '#28A745',
                  '&:hover': {
                    backgroundColor: '#218838',
                  },
                }}
                onClick={() => handleCheckout('paid', 'price_1PpEuvL0XfCTZc5C0fusAdV7')}
              >
                Choose Pro Plan
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default MyPage;