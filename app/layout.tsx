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
        <body>
          {!isAuthPage && (
            <Paper 
              elevation={0} 
              sx={{
                borderRadius: '0', // Removed border-radius for full-width navbar
                width: '100%', // Full width
                backgroundColor: 'white',
              }}
            >
              <AppBar 
                position="static" 
                sx={{
                  backgroundColor: 'white',
                  boxShadow: 'none',
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
                        QuizWhiz
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
                    <Box sx={{ marginLeft: 2 }}>
                      <UserButton />
                    </Box>
                    </SignedIn>
                  </Box>
                </Toolbar>
              </AppBar>
            </Paper>
          )}
          <Box sx={{ paddingTop: isAuthPage ? '0' : '80px' }}>
            {children}
          </Box>
        </body>
      </html>
    </ClerkProvider>
  );
}