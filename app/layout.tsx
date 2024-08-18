'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClerkProvider, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { AppBar, Toolbar, Typography, Button, Box, Paper } from '@mui/material';
import Link from 'next/link';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState<string>('');

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  const isAuthPage = currentPath === '/sign-in' || currentPath === '/sign-up';

  return (
    <ClerkProvider>
      <html lang="en">
        <body style={{ paddingTop: '80px' }}> {/* Adjust this value as needed */}
          {!isAuthPage && (
            <Paper 
              elevation={3} 
              sx={{
                position: 'fixed',
                top: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                borderRadius: '12px',
                width: '90%',
                maxWidth: '1200px',
                zIndex: 1100,
                backgroundColor: 'white',
              }}
            >
              <AppBar 
                position="static" 
                sx={{
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                  borderRadius: '12px',
                }}
              >
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box
                    sx={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: '#007BFF', // Background color
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#0056b3', // Hover background color
                      },
                    }}
                  >
                    <Link href="/" passHref>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: 'white', 
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'none',
                        },
                      }}
                      spellCheck={false}  // Disable spell check
                    >
                        FlashcardZ
                      </Typography>
                    </Link>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SignedOut>
                      <Button
                        sx={{
                          backgroundColor: '#007BFF',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#0056b3',
                          },
                        }}
                        href="/sign-in"
                      >
                        Sign Up
                      </Button>
                      <Button
                        sx={{
                          backgroundColor: '#28a745',
                          color: 'white',
                          marginLeft: 2,
                          '&:hover': {
                            backgroundColor: '#218838',
                          },
                        }}
                        href="/sign-up"
                      >
                        Login
                      </Button>
                    </SignedOut>
                    <SignedIn>
                      <UserButton sx={{ marginLeft: 2 }} />
                    </SignedIn>
                  </Box>
                </Toolbar>
              </AppBar>
            </Paper>
          )}
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}