import React from 'react';
import { Stack } from '@mui/material';
import AnalyticsView from '../views/AnalyticsView';

const StatsPage: React.FC = () => (
  <Stack spacing={4} sx={{ px: { xs: 2, md: 4 }, py: 3, width: '100%', maxWidth: 1400, mx: 'auto' }}>
    <AnalyticsView />
  </Stack>
);

export default StatsPage;
