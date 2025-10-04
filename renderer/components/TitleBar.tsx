import { useCallback, useEffect, useState } from 'react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import MinimizeIcon from '@mui/icons-material/Minimize';
import CloseIcon from '@mui/icons-material/Close';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import FilterNoneIcon from '@mui/icons-material/FilterNone';

const TitleBar = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  const syncMaximizedState = useCallback(async () => {
    try {
  const result = await (window.focusflow?.window?.isMaximized?.() ?? Promise.resolve(false));
      setIsMaximized(result);
    } catch (err) {
      // ignore when API is not available in fallback mode
      setIsMaximized(false);
    }
  }, []);

  useEffect(() => {
    void syncMaximizedState();
    const interval = window.setInterval(() => {
      void syncMaximizedState();
    }, 1500);
    return () => window.clearInterval(interval);
  }, [syncMaximizedState]);

  const handleMinimize = () => {
  void (window.focusflow?.window?.minimize?.() ?? Promise.resolve());
  };

  const handleMaximize = () => {
  void (window.focusflow?.window?.maximize?.() ?? Promise.resolve());
    void syncMaximizedState();
  };

  const handleClose = () => {
  void (window.focusflow?.window?.close?.() ?? Promise.resolve());
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        height: 56,
        px: 2.5,
        background: 'linear-gradient(120deg, rgba(122,108,255,0.65) 0%, rgba(67,255,210,0.4) 50%, rgba(255,140,201,0.45) 100%)',
        backdropFilter: 'blur(16px)',
        color: 'common.white',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: (theme) => theme.zIndex.appBar + 1,
        WebkitAppRegion: 'drag',
        userSelect: 'none'
      }}
    >
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{
          letterSpacing: 2.5,
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.9)',
          fontFamily: '"Space Grotesk", "Plus Jakarta Sans", "Segoe UI", sans-serif'
        }}
      >
        FocusFlow
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, WebkitAppRegion: 'no-drag' }}>
        <IconButton
          size="small"
          onClick={handleMinimize}
          sx={{
            color: 'common.white',
            background: 'linear-gradient(135deg, rgba(7,9,35,0.4), rgba(27,31,62,0.6))',
            border: '1px solid rgba(255,255,255,0.12)',
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(67,255,210,0.25))'
            }
          }}
        >
          <MinimizeIcon fontSize="inherit" />
        </IconButton>
        <IconButton
          size="small"
          onClick={handleMaximize}
          sx={{
            color: 'common.white',
            background: 'linear-gradient(135deg, rgba(7,9,35,0.4), rgba(27,31,62,0.6))',
            border: '1px solid rgba(255,255,255,0.12)',
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(122,108,255,0.28))'
            }
          }}
        >
          {isMaximized ? <FilterNoneIcon fontSize="inherit" /> : <CropSquareIcon fontSize="inherit" />}
        </IconButton>
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{
            color: 'common.white',
            background: 'linear-gradient(135deg, rgba(7,9,35,0.4), rgba(27,31,62,0.6))',
            border: '1px solid rgba(255,255,255,0.12)',
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(244,67,54,0.3), rgba(244,67,54,0.5))',
              borderColor: 'rgba(244,67,54,0.55)'
            }
          }}
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
      </Box>
    </Stack>
  );
};

export default TitleBar;
