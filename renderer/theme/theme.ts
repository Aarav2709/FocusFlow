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
              default: '#050505',
              paper: '#121212'
            },
            primary: {
              main: '#f0f0f0'
            },
            secondary: {
              main: '#9e9e9e'
            },
            text: {
              primary: '#ffffff',
              secondary: '#bdbdbd'
            }
          },
          typography: {
            fontFamily: 'Inter, Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            h5: {
              fontWeight: 700
            },
            h6: {
              fontWeight: 600
            },
            body2: {
              color: '#bdbdbd'
            }
          },
          shape: {
            borderRadius: 0
          },
          components: {
            MuiButton: {
              styleOverrides: {
                root: {
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 0
                }
              }
            },
            MuiCard: {
              styleOverrides: {
                root: {
                  borderRadius: 0
                }
              }
            },
            MuiPaper: {
              styleOverrides: {
                root: {
                  backgroundImage: 'none',
                  backgroundColor: '#121212',
                  color: '#f5f5f5',
                  borderRadius: 0
                }
              }
            },
            MuiListItemButton: {
              styleOverrides: {
                root: {
                  borderRadius: 0
                }
              }
            },
            MuiMenu: {
              styleOverrides: {
                paper: {
                  borderRadius: 0
                }
              }
            },
            MuiDialog: {
              styleOverrides: {
                paper: {
                  borderRadius: 0
                }
              }
            },
            MuiPopover: {
              styleOverrides: {
                paper: {
                  borderRadius: 0
                }
              }
            },
            MuiCssBaseline: {
              styleOverrides: {
                body: {
                  backgroundColor: '#050505',
                  color: '#f5f5f5',
                  scrollbarColor: '#333 #050505'
                },
                '*::-webkit-scrollbar': {
                  width: 8
                },
                '*::-webkit-scrollbar-track': {
                  background: '#050505'
                },
                '*::-webkit-scrollbar-thumb': {
                  backgroundColor: '#333',
                  borderRadius: 0
                }
              }
            }
          }
        })
      ),
    []
  );
