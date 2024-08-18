'use client'

import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // Ensure updateDoc is imported
import db from '../firebase'; // Ensure this path is correct
import { useUser } from '@clerk/clerk-react'; // or '@clerk/nextjs'
import { useRouter } from 'next/navigation';
import { Grid, Container, Card, CardContent, Typography, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material'; // Import MUI components

export default function FlashcardSets() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);
  const [newName, setNewName] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function getFlashcardSets() {
      if (!user) return;

      try {
        const docRef = doc(db, 'users', user.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const sets = docSnap.data().flashcardSets || [];
          setFlashcardSets(sets);
        } else {
          console.log('User document does not exist or has no flashcard sets.');
        }
      } catch (error) {
        console.error('Error fetching flashcard sets:', error);
      }
    }

    if (isLoaded && isSignedIn) {
      getFlashcardSets();
    }
  }, [isLoaded, isSignedIn, user]);

  const handleSetClick = (setName) => {
    router.push(`/flashcard?set=${encodeURIComponent(setName)}`);
  };

  const handleRenameClick = (setName) => {
    setSelectedSet(setName);
    setNewName(setName);
    setOpenDialog(true);
  };

  const handleDeleteClick = async (setName) => {
    if (user) {
        try {
            const userDocRef = doc(db, 'users', user.id);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                const data = docSnap.data().flashcardSets || [];
                console.log('Current flashcard sets:', data); // Debugging log

                const updatedSets = data.filter(set => {
                    const isMatch = set.name ? set.name !== setName : set !== setName;
                    console.log(`Comparing: ${set.name || set} with ${setName} -> ${isMatch}`);
                    return isMatch;
                });

                await updateDoc(userDocRef, { flashcardSets: updatedSets });
                setFlashcardSets(updatedSets);
                console.log('Flashcard set deleted successfully. Updated sets:', updatedSets);
            } else {
                console.log('User document does not exist.');
            }
        } catch (error) {
            console.error('Error deleting flashcard set:', error);
        }
    }
};

const handleRenameSet = async () => {
  if (user && newName.trim() !== '' && selectedSet !== newName) {
    try {
      const userDocRef = doc(db, 'users', user.id);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data().flashcardSets || [];
        console.log('Current flashcard sets:', data); // Debugging log

        const updatedSets = data.map(set => {
          if (typeof set === 'string') {
            return set === selectedSet ? newName : set;
          } else {
            return set.name === selectedSet ? { ...set, name: newName } : set;
          }
        });

        await updateDoc(userDocRef, { flashcardSets: updatedSets });
        setFlashcardSets(updatedSets);
        console.log('Flashcard set renamed successfully. Updated sets:', updatedSets);
      } else {
        console.log('User document does not exist.');
      }
    } catch (error) {
      console.error('Error renaming flashcard set:', error);
    }
  }

  setOpenDialog(false);
};

  const handleBackToGenerate = () => {
    router.push('/generate');
  };

  return (
    <Container maxWidth="md">
      <h1>Your Flashcard Sets</h1>
      <Button 
        variant="contained" 
        color="secondary" 
        onClick={handleBackToGenerate}
        sx={{ mb: 2 }}
      >
        Back to Generate
      </Button>
      <Grid container spacing={3} sx={{ mt: 4 }}>
        {flashcardSets.length > 0 ? (
          flashcardSets.map((set, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card style={{ cursor: 'pointer', position: 'relative' }}>
                <CardContent onClick={() => handleSetClick(set.name || set)}>
                  <Typography variant="h5" component="div">
                    {set.name || set}
                  </Typography>
                </CardContent>
                <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => handleRenameClick(set.name || set)}
                    sx={{ mr: 1 }}
                  >
                    Rename
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDeleteClick(set.name || set)}
                  >
                    Delete
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))
        ) : (
          <p>No flashcard sets found.</p>
        )}
      </Grid>

      {/* Dialog for renaming a flashcard set */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Rename Flashcard Set</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Set Name"
            type="text"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleRenameSet} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}