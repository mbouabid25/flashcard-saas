'use client'
import React from 'react';
import { Container, Box, Typography, AppBar, Toolbar, Button } from '@mui/material';
import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <Container>
      <AppBar position="static" sx={{ backgroundColor: '#3f51b5' }}>
        <Toolbar>
          <Link href="/" passHref>
            <Typography variant="h6" sx={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}>
              Flashcard SaaS
            </Typography>
          </Link>
          <Box sx={{ flexGrow: 1 }} /> {/* This will push the Sign In button to the right */}
          <Link href="/sign-in" passHref>
            <Button color="inherit">
              Sign In
            </Button>
          </Link>
        </Toolbar>
      </AppBar>

      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{ textAlign: 'center', my: 4 }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Sign Up
        </Typography>
        <SignUp />
      </Box>
    </Container>
  );
}