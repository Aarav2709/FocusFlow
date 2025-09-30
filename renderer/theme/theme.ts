import { useMemo } from 'react';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

export const useCreateTheme = () =>
  useMemo(
    () =>
      responsiveFontSizes(
        createTheme({
          palette: {
            mode: 'dark',
            background: {
              default: '#080b11',
              paper: '#0d1119'
            },
            primary: {
              main: '#5b7cfa'
            },
            secondary: {
              main: '#9f99ff'
            }
          },
          typography: {
            fontFamily: 'Inter, Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            h5: {
              fontWeight: 700
            },
            h6: {
              fontWeight: 600
            }
          },
          shape: {
            borderRadius: 18
          },
          components: {
            MuiButton: {
              styleOverrides: {
                root: {
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 14
                }
              }
            },
            MuiPaper: {
              styleOverrides: {
                root: {
                  backgroundImage: 'none'
                }
              }
            }
          }
        })
      ),
    []
  );
