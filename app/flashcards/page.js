'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import db from '../firebase';
import { useUser } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';
import {
  Grid,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  IconButton, 
  Menu, 
  MenuItem, 
  CssBaseline, 
  useTheme
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function FlashcardSets() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);
  const [newName, setNewName] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const theme = useTheme();

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

  const handleMenuClick = (event, setName) => {
    setAnchorEl(event.currentTarget);
    setSelectedSet(setName);
    setMenuOpen(true);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleRenameClick = () => {
    setNewName(selectedSet);
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleDeleteClick = async () => {
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.id);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data().flashcardSets || [];
          const updatedSets = data.filter((set) =>
            typeof set === 'string' ? set !== selectedSet : set.name !== selectedSet
          );

          await updateDoc(userDocRef, { flashcardSets: updatedSets });
          setFlashcardSets(updatedSets);
          console.log('Flashcard set deleted successfully.');
        } else {
          console.log('User document does not exist.');
        }
      } catch (error) {
        console.error('Error deleting flashcard set:', error);
      }
    }

    handleMenuClose();
  };

  const handleRenameSet = async () => {
    if (user && newName.trim() !== '' && selectedSet !== newName) {
      try {
        const userDocRef = doc(db, 'users', user.id);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data().flashcardSets || [];
          const updatedSets = data.map((set) =>
            typeof set === 'string' ? (set === selectedSet ? newName : set) : set.name === selectedSet ? { ...set, name: newName } : set
          );

          await updateDoc(userDocRef, { flashcardSets: updatedSets });
          setFlashcardSets(updatedSets);
          console.log('Flashcard set renamed successfully.');
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
    <>
      <CssBaseline />
      <Container maxWidth="md" sx={{ textAlign: 'center', mt: 8 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
            Your Flashcard Sets
          </Typography>
          <Grid container spacing={4}>
            {flashcardSets.length > 0 ? (
              flashcardSets.map((set, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                      borderRadius: '16px',
                      boxShadow: theme.shadows[5],
                      position: 'relative',
                    }}
                    onClick={() => handleSetClick(set.name || set)}
                  >
                    <CardContent>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 'medium', color: theme.palette.text.primary }}>
                        {set.name || set}
                      </Typography>
                    </CardContent>
                    <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuClick(e, set.name || set);
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </Card>
                </Grid>
              ))
            ) : (
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mt: 4 }}>
                No flashcard sets found.
              </Typography>
            )}
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={handleBackToGenerate}
              sx={{
                px: 4,
                py: 2,
                borderRadius: '30px',
                fontWeight: 'bold',
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              Back to Generate
            </Button>
          </Box>
        </Box>

        {/* Dropdown Menu for Rename/Delete */}
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 3,
            sx: { borderRadius: '10px' },
          }}
        >
          <MenuItem onClick={handleRenameClick}>Rename</MenuItem>
          <MenuItem onClick={handleDeleteClick}>Delete</MenuItem>
        </Menu>

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
              variant="outlined"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleRenameSet} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}