'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Use correct import for useRouter
import { useUser } from '@clerk/nextjs'; // Adjust if using a different auth provider
import { doc, collection, getDoc, setDoc } from 'firebase/firestore';
import  db  from '../firebase.js'; // Adjust path to your Firebase config
import {
  Container,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from '@mui/material';


export default function Flashcard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function getFlashcards() {
      if (!user) return;

      const docRef = doc(collection(db, 'users'), user.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const collections = docSnap.data().flashcards || [];
        setFlashcards(collections);
      } else {
        await setDoc(docRef, { flashcards: [] });
      }
    }

    if (isLoaded && isSignedIn) {
      getFlashcards();
    }
  }, [user, isLoaded, isSignedIn]);

  const handleCardClick = (id) => {
    router.push(`/flashcard?id=${id}`);
  };

  return (
    <Container maxWidth="md">
      <Grid container spacing={3} sx={{ mt: 4 }}>
        {flashcards.map((flashcard, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardActionArea onClick={() => handleCardClick(flashcard.name)}>
                <CardContent>
                  <Typography variant="h5" component="div">
                    {flashcard.name}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}