'use client'
import React, { createContext, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

export function Content({ children }) {
  // const selectedTheme = theme === 'dark' ? 'dark' : 'light';
  const theme = 'dark';

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const lightTheme = createTheme({
    palette: {
      mode: 'light',
    },
  });

  return (
    <ThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
        <div className={"content "+theme}>
          {children}
        </div>
    </ThemeProvider>
  );
}