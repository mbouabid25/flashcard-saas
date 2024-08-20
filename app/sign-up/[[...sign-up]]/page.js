'use client';
import React from 'react';
import { Container, Box, Typography, AppBar, Toolbar, Button } from '@mui/material';
import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <Container
      maxWidth="false"
      disableGutters
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #00F260 0%, #0575E6 50%, #7F00FF 100%)', // Gradient background
        color: '#fff',
        padding: 0,
        margin: 0,
        width: '100vw', // Ensure full width
      }}
    >
      <AppBar
        position="static"
        sx={{
          backgroundColor: 'transparent',
          boxShadow: 'none',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          width: '100%', // Ensure full width
        }}
      >
        <Toolbar>
          <Link href="/" passHref>
            <Typography
              variant="h6"
              sx={{
                cursor: 'pointer',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 'bold',
                flexGrow: 1,
              }}
            >
              Flashcard SaaS
            </Typography>
          </Link>
          <Link href="/sign-up" passHref>
            <Button
              color="inherit"
              sx={{
                border: '1px solid rgba(255, 255, 255, 0.7)',
                borderRadius: '20px',
                padding: '5px 15px',
                color: '#fff',
                transition: '0.3s',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
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
        sx={{
          textAlign: 'center',
          padding: '40px',
          borderRadius: '12px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(10px)',
          mt: 4,
          width: '100%', // Ensure full width
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: '20px',
          }}
        >
          Login
        </Typography>
        <SignIn
          appearance={{
            elements: {
              card: {
                backgroundColor: 'transparent',
                boxShadow: 'none',
              },
              header: {
                color: '#fff',
              },
              formButtonPrimary: {
                backgroundColor: '#32CD32', // Vibrant green color
                '&:hover': {
                  backgroundColor: '#2eb82e', // Darker green on hover
                },
              },
              input: {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                borderRadius: '8px',
                '&::placeholder': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              },
              footer: {
                color: '#fff',
              },
            },
          }}
        />
      </Box>
    </Container>
  );
}
