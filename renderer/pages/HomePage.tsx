import React from 'react';
import { Stack } from '@mui/material';
import TimerPanel from '../components/home/TimerPanel';

const HomePage: React.FC = () => (
  <Stack spacing={1} sx={{ px: { xs: 2, md: 4 }, pt: 0.5, pb: 0, maxWidth: 640, mx: 'auto', width: '100%' }}>
    <TimerPanel />
  </Stack>
);

export default HomePage;
