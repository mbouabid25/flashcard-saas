'use client';
import React, { useState } from 'react';
import { doc, collection, getDoc, writeBatch } from 'firebase/firestore';
import db from '../firebase.js'; // Adjust path to your Firebase config
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const backgroundStyle = {
  background: 'linear-gradient(135deg, #ff6ec4, #ff9a8b)', // Neon pink gradient
  minHeight: '100vh',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  width: '100vw',
};

const animatedCardStyle = {
  position: 'relative',
  height: '100%',
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  overflow: 'hidden',
};

const flashcardContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '16px',
  height: '100%',
};

const separatorStyle = {
  height: '2px',
  width: '100%',
  backgroundColor: '#000', // Black line between front and back
  margin: '8px 0',
};

const neonButtonStyle = {
  background: 'linear-gradient(45deg, #ff6ec4, #ff9a8b)', // Neon gradient button
  color: '#fff',
  '&:hover': {
    background: 'linear-gradient(45deg, #ff9a8b, #ff6ec4)',
  },
};

export default function Generate() {
  const [text, setText] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [setName, setSetName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert('Please enter some text to generate flashcards.');
      return;
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }

      const data = await response.json();
      setFlashcards(data);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      alert('An error occurred while generating flashcards. Please try again.');
    }
  };

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  const saveFlashcards = async () => {
    if (!setName.trim()) {
      alert('Please enter a name for your flashcard set.');
      return;
    }

    try {
      const user = { id: 'USER_ID' }; // Replace with actual user ID

      const userDocRef = doc(collection(db, 'users'), user.id);
      const userDocSnap = await getDoc(userDocRef);

      const batch = writeBatch(db);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const updatedSets = [...(userData.flashcardSets || []), { name: setName }];
        batch.update(userDocRef, { flashcardSets: updatedSets });
      } else {
        batch.set(userDocRef, { flashcardSets: [{ name: setName }] });
      }

      const setDocRef = doc(collection(userDocRef, 'flashcardSets'), setName);
      batch.set(setDocRef, { flashcards });

      await batch.commit();

      alert('Flashcards saved successfully!');
      handleCloseDialog();
      setSetName('');
    } catch (error) {
      console.error('Error saving flashcards:', error);
      alert('An error occurred while saving flashcards. Please try again.');
    }
  };

  return (
    <Elements stripe={stripePromise}>
      <Box sx={backgroundStyle}>
        <Container maxWidth="lg">
          <Box sx={{ my: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom color="#fff">
              Generate Flashcards
            </Typography>
            <TextField
              value={text}
              onChange={(e) => setText(e.target.value)}
              label="Enter text"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              sx={{ mb: 2, bgcolor: '#fff' }}
            />
            <Button
              variant="contained"
              sx={neonButtonStyle}
              onClick={handleSubmit}
              fullWidth
            >
              Generate Flashcards
            </Button>
          </Box>

          {flashcards.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom color="#fff">
                Generated Flashcards
              </Typography>
              <Grid container spacing={2}>
                {flashcards.map((flashcard, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card sx={animatedCardStyle}>
                      <CardContent sx={flashcardContentStyle}>
                        <Typography variant="h6">Front:</Typography>
                        <Typography>{flashcard.front}</Typography>
                        <Box sx={separatorStyle} />
                        <Typography variant="h6">Back:</Typography>
                        <Typography>{flashcard.back}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {flashcards.length > 0 && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                sx={neonButtonStyle}
                onClick={handleOpenDialog}
              >
                Save Flashcards
              </Button>
            </Box>
          )}

          <Dialog open={dialogOpen} onClose={handleCloseDialog}>
            <DialogTitle>Save Flashcard Set</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Please enter a name for your flashcard set.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                label="Set Name"
                type="text"
                fullWidth
                variant="outlined"
                value={setName}
                onChange={(e) => setSetName(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={saveFlashcards}>Save</Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </Elements>
  );
}


  