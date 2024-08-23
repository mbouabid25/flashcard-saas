'use client'
import React from 'react';
import { Container, Box, Typography, AppBar, Toolbar, Button } from '@mui/material';
import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <Container>
      <AppBar position="static" sx={{ backgroundColor: '#3f51b5' }}>
        <Toolbar>
          <Link href="/" passHref>
            <Typography variant="h6" sx={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}>
              QuizWhiz
            </Typography>
          </Link>
          <Box sx={{ flexGrow: 1 }} /> {/* This will push the Sign Up button to the right */}
          <Link href="/sign-up" passHref>
            <Button color="inherit">
              Sign Up
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
          Login
        </Typography>
        <SignIn />
      </Box>
    </Container>
  );
}