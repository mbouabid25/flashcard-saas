'use client'; // Mark this component as a Client Component

import React, { useEffect, useState } from 'react';
import { Button, Box, Typography, Grid } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/clerk-react';
import { doc, getDoc } from 'firebase/firestore';
import db from './firebase'; // Ensure this path is correct
import getStripe from '../utils/get-stripe'; // Ensure this path is correct
import styles from './page.module.css'; // Import CSS module for styling

const MyPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [flashcardSets, setFlashcardSets] = useState([]);

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

      <Box sx={{ my: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Your Flashcard Sets
        </Typography>
        <Box
          sx={{
            border: '1px solid #ccc',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '24px',
          }}
        >
          <Grid container spacing={4}>
            {flashcardSets.length > 0 ? (
              flashcardSets.map((set, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box className={styles.flashcardSetPreview}>
                    <Typography variant="h6" gutterBottom>
                      {set.name}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {set.prompt.slice(0, 100)}...
                    </Typography>
                  </Box>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography sx={{ textAlign: 'center' }}>No flashcard sets found.</Typography>
              </Grid>
            )}
          </Grid>
          {flashcardSets.length > 0 && (
            <Button
              variant="outlined"
              sx={{ mt: 2, display: 'block', margin: '0 auto' }}
              onClick={() => router.push('/flashcards')}
            >
              See More
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ my: 6, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Pricing
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {/* Basic Plan */}
          <Grid item xs={12} sm={6} md={4}>
            <Box
              sx={{
                border: '1px solid #ccc',
                borderRadius: '10px',
                padding: '16px',
              }}
            >
              <Typography variant="h5" gutterBottom>
                Basic Plan
              </Typography>
              <Typography 
              variant="h5" 
              gutterBottom
              sx={{ 
                color: 'rgb(189, 195, 199)', 
                fontSize: '0.875rem' // This sets the font size to be smaller
              }}
            >
              Limited plan. Generate up to 10 sets.
            </Typography>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                $0/month
              </Typography>
              <Button
                variant="contained"
                color="primary"
                disabled={loading}
                onClick={() => handleCheckout('free')}
              >
                {loading ? 'Processing...' : 'Choose Free Plan'}
              </Button>
            </Box>
          </Grid>
          
          {/* Pro Plan */}
          <Grid item xs={12} sm={6} md={4}>
            <Box
              sx={{
                border: '1px solid #ccc',
                borderRadius: '10px',
                padding: '16px',
              }}
            >
              <Typography variant="h5" gutterBottom>
                Pro Plan
              </Typography>
              <Typography 
              variant="h5" 
              gutterBottom
              sx={{ 
                color: 'rgb(189, 195, 199)', 
                fontSize: '0.875rem' // This sets the font size to be smaller
              }}
            >
              Unlimited plan. The options are endless!
            </Typography>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                $1/month
              </Typography>
              <Button
                variant="contained"
                color="primary"
                disabled={loading}
                onClick={() => handleCheckout('paid', 'price_1PpEuvL0XfCTZc5C0fusAdV7')}
              >
                {loading ? 'Processing...' : 'Choose Pro Plan'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default MyPage;