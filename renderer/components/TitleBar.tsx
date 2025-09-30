import { useCallback, useEffect, useState } from 'react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import MinimizeIcon from '@mui/icons-material/Minimize';
import CloseIcon from '@mui/icons-material/Close';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import FilterNoneIcon from '@mui/icons-material/FilterNone';

const TitleBar = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  const syncMaximizedState = useCallback(async () => {
    const result = await window.ypt.window.isMaximized();
    setIsMaximized(result);
  }, []);

  useEffect(() => {
    void syncMaximizedState();
    const interval = window.setInterval(() => {
      void syncMaximizedState();
    }, 1500);
    return () => window.clearInterval(interval);
  }, [syncMaximizedState]);

  const handleMinimize = () => {
    void window.ypt.window.minimize();
  };

  const handleMaximize = () => {
    void window.ypt.window.maximize();
    void syncMaximizedState();
  };

  const handleClose = () => {
    void window.ypt.window.close();
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        height: 56,
        px: 2.5,
        backgroundColor: 'rgba(13, 17, 25, 0.92)',
        backdropFilter: 'blur(8px)',
        color: 'common.white',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        WebkitAppRegion: 'drag',
        userSelect: 'none'
      }}
    >
      <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 1.2 }}>
        Yeolpumta
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, WebkitAppRegion: 'no-drag' }}>
        <IconButton size="small" onClick={handleMinimize} sx={{ color: 'grey.200' }}>
          <MinimizeIcon fontSize="inherit" />
        </IconButton>
        <IconButton size="small" onClick={handleMaximize} sx={{ color: 'grey.200' }}>
          {isMaximized ? <FilterNoneIcon fontSize="inherit" /> : <CropSquareIcon fontSize="inherit" />}
        </IconButton>
        <IconButton size="small" onClick={handleClose} sx={{ color: 'grey.200', '&:hover': { color: 'error.light' } }}>
          <CloseIcon fontSize="inherit" />
        </IconButton>
      </Box>
    </Stack>
  );
};

export default TitleBar;
