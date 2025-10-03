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
        backgroundColor: 'rgba(8, 8, 8, 0.92)',
        backdropFilter: 'blur(10px)',
        color: 'common.white',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        position: 'sticky',
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        WebkitAppRegion: 'drag',
        userSelect: 'none'
      }}
    >
      <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 1.2 }}>
  FocusFlow
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, WebkitAppRegion: 'no-drag' }}>
        <IconButton size="small" onClick={handleMinimize} sx={{ color: 'grey.200', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
          <MinimizeIcon fontSize="inherit" />
        </IconButton>
        <IconButton size="small" onClick={handleMaximize} sx={{ color: 'grey.200', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
          {isMaximized ? <FilterNoneIcon fontSize="inherit" /> : <CropSquareIcon fontSize="inherit" />}
        </IconButton>
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{ color: 'grey.200', '&:hover': { bgcolor: 'rgba(244,67,54,0.2)', color: 'error.light' } }}
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
      </Box>
    </Stack>
  );
};

export default TitleBar;
