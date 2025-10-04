import React from 'react';
import { Stack } from '@mui/material';
import TimerPanel from '../components/home/TimerPanel';

const HomePage: React.FC = () => (
  <Stack spacing={3} sx={{ px: { xs: 1.5, md: 0 }, pt: 0.5, pb: 0, width: '100%' }}>
    <TimerPanel />
  </Stack>
);

export default HomePage;
