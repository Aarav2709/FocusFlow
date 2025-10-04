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
              default: '#050217',
              paper: 'rgba(10, 12, 33, 0.65)'
            },
            primary: {
              main: '#7a6cff'
            },
            secondary: {
              main: '#43ffd2'
            },
            success: {
              main: '#64f8a6'
            },
            warning: {
              main: '#ffb74d'
            },
            text: {
              primary: '#f3f5ff',
              secondary: '#9fa6ff'
            }
          },
          typography: {
            fontFamily: 'Space Grotesk, Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            h1: {
              fontWeight: 600,
              letterSpacing: '-0.04em'
            },
            h2: {
              fontWeight: 600,
              letterSpacing: '-0.02em'
            },
            h5: {
              fontWeight: 700
            },
            h6: {
              fontWeight: 600
            },
            subtitle1: {
              fontWeight: 500
            },
            body2: {
              color: '#9fa6ff'
            },
            button: {
              fontWeight: 600,
              letterSpacing: 0.4
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
                  borderRadius: 0,
                  paddingInline: 24,
                  paddingBlock: 10
                },
                contained: {
                  boxShadow: '0 14px 32px rgba(122, 108, 255, 0.35)',
                  backgroundImage: 'linear-gradient(135deg, #7a6cff 0%, #50e3c2 120%)',
                  color: '#050217',
                  borderRadius: 0
                },
                containedInherit: {
                  boxShadow: '0 14px 32px rgba(122, 108, 255, 0.35)',
                  backgroundImage: 'linear-gradient(135deg, #7a6cff 0%, #50e3c2 120%)',
                  color: '#050217',
                  borderRadius: 0
                },
                containedSecondary: {
                  boxShadow: '0 14px 32px rgba(67, 255, 210, 0.25)',
                  backgroundImage: 'linear-gradient(135deg, #43ffd2 0%, #7a6cff 120%)',
                  color: '#050217',
                  borderRadius: 0
                }
              }
            },
            MuiCard: {
              styleOverrides: {
                root: {
                  borderRadius: 0,
                  border: '1px solid rgba(126, 112, 255, 0.18)',
                  background: 'linear-gradient(155deg, rgba(13, 16, 39, 0.92) 2%, rgba(16, 21, 50, 0.72) 100%)',
                  boxShadow: '0 24px 54px rgba(11, 9, 40, 0.45)'
                }
              }
            },
            MuiPaper: {
              styleOverrides: {
                root: {
                  borderRadius: 0,
                  backgroundImage: 'linear-gradient(155deg, rgba(16, 19, 48, 0.75) 0%, rgba(8, 10, 27, 0.85) 100%)',
                  color: '#f3f5ff',
                  backdropFilter: 'blur(18px)',
                  border: '1px solid rgba(124, 119, 255, 0.16)'
                }
              }
            },
            MuiListItemButton: {
              styleOverrides: {
                root: {
                  borderRadius: 0,
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, rgba(122, 108, 255, 0.25), rgba(80, 227, 194, 0.25))',
                    border: '1px solid rgba(122, 108, 255, 0.45)'
                  }
                }
              }
            },
            MuiDialog: {
              styleOverrides: {
                paper: {
                  borderRadius: 0,
                  background: 'linear-gradient(160deg, rgba(15, 20, 49, 0.96), rgba(5, 4, 24, 0.96))',
                  border: '1px solid rgba(124, 119, 255, 0.25)'
                }
              }
            },
            MuiMenu: {
              styleOverrides: {
                paper: {
                  borderRadius: 0,
                  background: 'rgba(15, 17, 41, 0.96)',
                  border: '1px solid rgba(122, 108, 255, 0.2)'
                }
              }
            },
            MuiPopover: {
              styleOverrides: {
                paper: {
                  borderRadius: 0,
                  backdropFilter: 'blur(18px)',
                  border: '1px solid rgba(122, 108, 255, 0.18)'
                }
              }
            },
            MuiLinearProgress: {
              styleOverrides: {
                root: {
                  height: 10,
                  borderRadius: 0,
                  backgroundColor: 'rgba(122, 108, 255, 0.16)'
                },
                bar: {
                  borderRadius: 0,
                  backgroundImage: 'linear-gradient(135deg, #7a6cff 0%, #43ffd2 100%)'
                }
              }
            },
            MuiCssBaseline: {
              styleOverrides: {
                body: {
                  backgroundColor: '#050217',
                  backgroundImage:
                    'radial-gradient(circle at 20% 20%, rgba(122,108,255,0.25), transparent 45%), radial-gradient(circle at 80% 0%, rgba(67,255,210,0.2), transparent 40%), radial-gradient(circle at 50% 80%, rgba(255, 140, 201, 0.12), transparent 45%)',
                  color: '#f3f5ff',
                  scrollbarColor: 'rgba(122,108,255,0.4) rgba(5,2,23,0.8)',
                  transition: 'background 600ms ease'
                },
                a: {
                  color: '#43ffd2'
                },
                '*::-webkit-scrollbar': {
                  width: 8,
                  height: 8
                },
                '*::-webkit-scrollbar-track': {
                  background: 'rgba(5,2,23,0.85)'
                },
                '*::-webkit-scrollbar-thumb': {
                  backgroundImage: 'linear-gradient(135deg, #7a6cff 0%, #43ffd2 140%)',
                  borderRadius: 0
                }
              }
            }
          }
        })
      ),
    []
  );
