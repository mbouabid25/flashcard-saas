'use client';

import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/system';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/clerk-react';
import db from '../firebase'; // Adjust the path as needed
import { doc, getDoc, collection, writeBatch } from 'firebase/firestore';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';

const CardContainer = styled('div')({
  perspective: '1000px',
});

const FlipCard = styled('div')(({ flipped }) => ({
  position: 'relative',
  width: '100%',
  height: '300px',
  transformStyle: 'preserve-3d',
  transition: 'transform 0.6s',
  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
}));

const CardInner = styled('div')({
  position: 'absolute',
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backfaceVisibility: 'hidden',
  transformStyle: 'preserve-3d',
});

const CardFace = styled(Card)({
  position: 'absolute',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backfaceVisibility: 'hidden',
  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
});

const FrontFace = styled(CardFace)({
  zIndex: 2, // Ensure it's above the back face
  transform: 'rotateY(0deg)', // Keep the text orientation normal
});

const BackFace = styled(CardFace)({
  transform: 'rotateY(180deg)', // Rotate the back face so it matches the card rotation
});

export default function Generate() {
  const [text, setText] = useState('');  // This will be the prompt used to generate flashcards
  const [flashcards, setFlashcards] = useState([]);
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);
  const [flipped, setFlipped] = useState({});
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const router = useRouter();
  const { user } = useUser(); // Get the user from Clerk

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
        body: JSON.stringify({ text }),  // Store this text as the prompt
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate flashcards: ${errorText}`);
      }

      const data = await response.json();

      if (data.flashcards) {
        setFlashcards([...data.flashcards]);
      } else {
        console.error('Invalid data format:', data);
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      alert(`An error occurred while generating flashcards: ${error.message}`);
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
        body: JSON.stringify({ text }),  // Use the same text (prompt) to generate a single flashcard
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate flashcard: ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data); // Log the entire API response for debugging

      if (data.flashcard) {
        setFlashcards(prev => [...prev, { ...data.flashcard }]); // Add the new flashcard to the list
        console.log('Flashcards state after addition:', flashcards); // Log the updated state
      } else {
        console.error('Invalid data format:', data);
      }
      
      handleMenuClose(); // Close the dropdown menu
    } catch (error) {
      console.error('Error generating flashcard:', error);
      alert(`An error occurred while generating the flashcard: ${error.message}`);
    }
  };

  const handleCardClick = (index) => {
    setFlipped((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleDelete = (index) => {
    setFlashcards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRegenerate = async (index) => {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: flashcards[index].front }), // Regenerate using the front text
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to regenerate flashcard: ${errorText}`);
      }

      const data = await response.json();

      if (data.flashcards && data.flashcards[0]) {
        setFlashcards((prev) =>
          prev.map((card, i) => (i === index ? data.flashcards[0] : card))
        );
      } else {
        console.error('Invalid data format:', data);
      }
    } catch (error) {
      console.error('Error regenerating flashcard:', error);
      alert(`An error occurred while regenerating flashcard: ${error.message}`);
    }
  };

  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
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

    setFlashcards((prev) => [
      ...prev,
      { front: newFront, back: newBack },
    ]);
    handleCloseAddDialog();
  };

  const saveFlashcards = async () => {
    if (!name.trim()) {
      alert('Please enter a name for your flashcard set.');
      return;
    }
  
    if (user) {
      const userId = user.id;
      const setPrompt = text; // Use the stored prompt for the set
  
      try {
        const userDocRef = doc(db, 'users', userId);
        let docSnap = await getDoc(userDocRef);
  
        if (!docSnap.exists()) {
          await setDoc(userDocRef, { flashcardSets: [] });
          docSnap = await getDoc(userDocRef);
        }
  
        const batch = writeBatch(db);
        const sets = docSnap.data().flashcardSets || [];
  
        if (sets.some(set => set.name === name)) {
          alert('Flashcard set with the same name already exists');
          return;
        } else {
          sets.push({ name, prompt: setPrompt }); // Store the set name and the prompt
          batch.update(userDocRef, { flashcardSets: sets });
        }
  
        const colRef = collection(db, `users/${userId}/${name}`);
  
        flashcards.forEach((flashcard) => {
          const cardDocRef = doc(colRef);
          batch.set(cardDocRef, flashcard);
        });
  
        await batch.commit();
        alert('Flashcards saved successfully!');
  
        handleCloseDialog(); // Close the dialog before redirecting
        router.push("/flashcards"); // Redirect to the saved flashcards page
      } catch (error) {
        console.error('Error saving flashcards:', error);
        alert(`An error occurred while saving flashcards: ${error.message}`);
      }
    } else {
      alert('No user is currently signed in.');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
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
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          fullWidth
        >
          Generate Flashcards
        </Button>
      </Box>

      <Box sx={{ my: 4 }}>
        {flashcards.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Flashcards Preview
            </Typography>
            <Grid container spacing={3}>
              {flashcards.map((flashcard, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <CardContainer>
                    <FlipCard flipped={flipped[index]} onClick={() => handleCardClick(index)}>
                      <CardInner>
                        {/* Front Side */}
                        <FrontFace>
                          <Typography variant="h5" component="div">
                            {flashcard.front}
                          </Typography>
                        </FrontFace>
    
                        {/* Back Side */}
                        <BackFace>
                          <Typography variant="h5" component="div">
                            {flashcard.back}
                          </Typography>
                        </BackFace>
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
            <Button variant="contained" color="primary" onClick={handleOpenDialog}>
              Save Flashcards
            </Button>
          </Box>
        )}
      </Box>

      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleMenuClick}
        sx={{ mt: 2, mb: 4 }}
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

      <Dialog open={open} onClose={handleCloseDialog}>
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
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={saveFlashcards} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}