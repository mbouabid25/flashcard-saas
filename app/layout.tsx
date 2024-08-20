"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClerkProvider, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import Link from "next/link"; // Import Link

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState<string>("");

  useEffect(() => {
    // Set current path when component mounts
    setCurrentPath(window.location.pathname);
  }, []);

  const isAuthPage = currentPath === "/sign-in" || currentPath === "/sign-up";

  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {!isAuthPage && (
            <AppBar position="static">
              <Toolbar
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <Link href="/" passHref>
                  <Typography
                    variant="h6"
                    sx={{
                      flexGrow: 1,
                      cursor: "pointer",
                      color: "inherit",
                      textDecoration: "none",
                    }}
                  >
                    Flashcard SaaS
                  </Typography>
                </Link>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <SignedOut>
                    <Button color="inherit" href="/sign-in">
                      Sign Up
                    </Button>
                    <Button
                      color="inherit"
                      href="/sign-up"
                      sx={{ marginLeft: 2 }}
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
          )}
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
