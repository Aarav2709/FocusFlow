import React from 'react';
import { Stack } from '@mui/material';
import TimerPanel from '../components/home/TimerPanel';

const HomePage: React.FC = () => (
  <Stack spacing={2.5} sx={{ px: { xs: 2, md: 4 }, py: 2, maxWidth: 640, mx: 'auto', width: '100%' }}>
    <TimerPanel />
  </Stack>
);

export default HomePage;
