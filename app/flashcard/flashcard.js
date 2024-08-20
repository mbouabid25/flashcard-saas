'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Container, Grid, Card, CardActionArea, CardContent, Typography, Box, Button, Stack } from '@mui/material';
import { doc, collection, getDocs } from 'firebase/firestore';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import db from '../firebase.js'; // Adjust path to your Firebase config

export default function Flashcard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState({});
  const searchParams = useSearchParams();
  const search = searchParams.get('id');
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    async function getFlashcard() {
      if (!search || !user) return;

      const colRef = collection(doc(collection(db, 'users'), user.id), search);
      const docs = await getDocs(colRef);
      const flashcards = [];
      docs.forEach((doc) => {
        flashcards.push({ id: doc.id, ...doc.data() });
      });
      setFlashcards(flashcards);
    }

    if (isLoaded && isSignedIn) {
      getFlashcard();
    }
  }, [search, user, isLoaded, isSignedIn]);

  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 5, color: 'primary.main' }}>
        Your Flashcards
      </Typography>
      <Grid container spacing={3}>
        {flashcards.map((flashcard) => (
          <Grid item xs={12} sm={6} md={4} key={flashcard.id}>
            <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 3 }}>
              <CardActionArea onClick={() => handleCardClick(flashcard.id)}>
                <CardContent sx={{ position: 'relative', height: 200 }}>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      transform: flipped[flashcard.id] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      transformStyle: 'preserve-3d',
                      transition: 'transform 0.6s ease-in-out',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'background.paper',
                        p: 2,
                      }}
                    >
                      <Typography variant="h5" component="div">
                        {flashcard.front}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'primary.light',
                        p: 2,
                      }}
                    >
                      <Typography variant="h5" component="div" color="white">
                        {flashcard.back}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Stack spacing={2} direction="row" sx={{ mt: 5, justifyContent: 'center' }}>
        <Button variant="contained" color="primary">
          Buy More Flashcards
        </Button>
        <Button variant="outlined" color="secondary">
          Subscribe for Premium
        </Button>
      </Stack>
    </Container>
  );
}
