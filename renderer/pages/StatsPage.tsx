import React from 'react';
import { Stack, Typography } from '@mui/material';
import InsightsPanel from '../components/home/InsightsPanel';

const StatsPage: React.FC = () => (
  <Stack spacing={4} sx={{ px: { xs: 2, md: 4 }, py: 3, width: '100%', maxWidth: 1200, mx: 'auto' }}>
    <Stack spacing={0.5}>
      <Typography variant="h5" fontWeight={700}>
        Insights
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Review your focus history and subject breakdowns.
      </Typography>
    </Stack>
    <InsightsPanel />
  </Stack>
);

export default StatsPage;
