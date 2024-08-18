'use client';

import { useEffect, useState } from 'react';
import { doc, collection, getDocs, getDoc, writeBatch } from 'firebase/firestore';
import db from '../firebase'; // Ensure this path is correct
import { Container, Grid, Typography, Box, Button, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material'; // Import MUI components
import { useUser } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function Flashcards({ params, searchParams }) {
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newFront, setNewFront] = useState(''); // For manual entry only
  const [newBack, setNewBack] = useState('');  // For manual entry only
  const { user } = useUser();
  const set = searchParams.set; // Assuming you pass `set` as a query parameter
  const router = useRouter(); // For navigation

  const [setPrompt, setSetPrompt] = useState(''); // Store the initial prompt used to create the set

  useEffect(() => {
    async function getFlashcards() {
      if (!set || !user) return;

      try {
        const userDocRef = doc(db, 'users', user.id);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const sets = docSnap.data().flashcardSets || [];
          const currentSet = sets.find(s => s.name === set);

          if (currentSet) {
            setSetPrompt(currentSet.prompt); // Store the prompt in state

            const colRef = collection(userDocRef, set);
            const querySnapshot = await getDocs(colRef);

            const cards = [];
            querySnapshot.forEach((doc) => {
              cards.push(doc.data());
            });

            setFlashcards(cards);
            setFlipped(Array(cards.length).fill(false));
          }
        }
      } catch (error) {
        console.error('Error fetching flashcards:', error);
      }
    }

    getFlashcards();
  }, [set, user]);

  const saveFlashcards = async () => {
    if (user) {
      const userId = user.id;
      try {
        const userDocRef = doc(db, 'users', userId);
        const colRef = collection(db, `users/${userId}/${set}`);
        const batch = writeBatch(db);

        // Clear existing flashcards in the collection
        const existingDocs = await getDocs(colRef);
        existingDocs.forEach((doc) => {
          batch.delete(doc.ref);
        });

        // Add the updated flashcards to the collection
        flashcards.forEach((flashcard) => {
          const cardDocRef = doc(colRef);
          batch.set(cardDocRef, flashcard);
        });

        await batch.commit();
        console.log('Flashcards saved successfully!');
      } catch (error) {
        console.error('Error saving flashcards:', error);
        alert(`An error occurred while saving flashcards: ${error.message}`);
      }
    }
  };

  const handleCardClick = (index) => {
    setFlipped((prev) => {
      const newFlipped = [...prev];
      newFlipped[index] = !newFlipped[index];
      return newFlipped;
    });
  };

  const handleDelete = (index) => {
    const updatedFlashcards = flashcards.filter((_, i) => i !== index);
    setFlashcards(updatedFlashcards); // Ensure the state is updated
  };

  const handleRegenerate = async (index) => {
    const originalFront = flashcards[index].front;

    try {
      const response = await fetch('/api/generate-single', {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: originalFront }), // Regenerate based on the original front text
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to regenerate flashcard: ${errorText}`);
      }

      const data = await response.json();
      if (data.flashcard) {
        const updatedFlashcards = flashcards.map((card, i) => (i === index ? data.flashcard : card));
        setFlashcards(updatedFlashcards);
      } else {
        console.error('Invalid data format:', data);
      }
    } catch (error) {
      console.error('Error regenerating flashcard:', error);
      alert(`An error occurred while regenerating the flashcard: ${error.message}`);
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleManualAddClick = () => {
    setAddDialogOpen(true);
    handleMenuClose();
  };

  const handleGenerateClick = async () => {
    console.log('Generate Flashcard clicked'); // Debugging log

    try {
      const response = await fetch('/api/generate-single', {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: setPrompt }), // Use the initial prompt stored in `setPrompt`
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate flashcard: ${errorText}`);
      }

      const data = await response.json();
      console.log('Generated Flashcard:', data.flashcard); // Debugging log

      if (data.flashcard) {
        const updatedFlashcards = [...flashcards, { ...data.flashcard }];
        setFlashcards(updatedFlashcards); // Ensure a new array is created
      } else {
        console.error('Invalid data format:', data);
      }

      handleMenuClose(); // Close the dropdown menu
    } catch (error) {
      console.error('Error generating flashcard:', error);
      alert(`An error occurred while generating the flashcard: ${error.message}`);
    }
  };

  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
    setNewFront('');
    setNewBack('');
  };

  const handleAddFlashcardSubmit = () => {
    if (!newFront.trim() || !newBack.trim()) {
      alert('Please fill in both the front and back of the flashcard.');
      return;
    }

    const updatedFlashcards = [...flashcards, { front: newFront, back: newBack }];
    setFlashcards(updatedFlashcards);
    handleCloseAddDialog();
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Button variant="contained" color="secondary" onClick={() => router.push('/flashcards')}>
          Back to Flashcard Sets
        </Button>
        {/* Add the dropdown button for adding or generating a flashcard */}
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleMenuClick}
          sx={{ ml: 2 }}
        >
          Add Flashcard
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleManualAddClick}>Manually Add Flashcard</MenuItem>
          <MenuItem onClick={handleGenerateClick}>Generate Flashcard</MenuItem>
        </Menu>
        {flashcards.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              {set} Flashcards
            </Typography>
            <Grid container spacing={3}>
              {flashcards.map((flashcard, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <CardContainer>
                    <FlipCard flipped={flipped[index]} onClick={() => handleCardClick(index)}>
                      <CardInner>
                        {/* Front Side */}
                        <CardFace className="front">
                          <Typography variant="h5" component="div">
                            {flashcard.front}
                          </Typography>
                        </CardFace>

                        {/* Back Side */}
                        <CardFace className="back">
                          <Typography variant="h5" component="div">
                            {flashcard.back}
                          </Typography>
                        </CardFace>
                      </CardInner>
                    </FlipCard>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <IconButton color="secondary" onClick={() => handleDelete(index)}>
                        <DeleteIcon />
                      </IconButton>
                      <IconButton color="primary" onClick={() => handleRegenerate(index)}>
                        <RefreshIcon />
                      </IconButton>
                    </Box>
                  </CardContainer>
                  </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {flashcards.length > 0 && (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" color="primary" onClick={saveFlashcards}>
              Save Flashcards
            </Button>
          </Box>
        )}
      </Box>

      <Dialog open={addDialogOpen} onClose={handleCloseAddDialog}>
        <DialogTitle>Add New Flashcard</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Front"
            type="text"
            fullWidth
            value={newFront}
            onChange={(e) => setNewFront(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Back"
            type="text"
            fullWidth
            value={newBack}
            onChange={(e) => setNewBack(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button onClick={handleAddFlashcardSubmit} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

// Styled Components
const CardContainer = styled.div`
  perspective: 1000px;
  cursor: pointer;
`;

const FlipCard = styled.div`
  width: 100%;
  height: 250px; /* Set a fixed height for consistency */
  transform-style: preserve-3d;
  transition: transform 0.6s;
  transform: ${(props) => (props.flipped ? 'rotateY(180deg)' : 'rotateY(0deg)')};
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1), 0px 8px 20px rgba(0, 0, 0, 0.1); /* Add shadow for depth */
  border: 1px solid #ccc; /* Add a subtle border */
  border-radius: 10px; /* Rounded corners for a smooth look */
`;

const CardInner = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff; /* Ensure a white background for both sides */
  border-radius: 10px; /* Ensure inner content matches the card's rounded corners */
  box-shadow: inset 0px 2px 4px rgba(0, 0, 0, 0.1); /* Inner shadow for added depth */
`;

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  backface-visibility: hidden;
  
  &.front {
    background-color: #fff;
  }
  
  &.back {
    background-color: #f0f0f0;
    transform: rotateY(180deg);
  }
`;