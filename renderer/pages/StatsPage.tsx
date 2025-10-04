import React from 'react';
import { Chip, Stack, Typography } from '@mui/material';
import InsightsPanel from '../components/home/InsightsPanel';

const StatsPage: React.FC = () => (
  <Stack spacing={4} sx={{ px: { xs: 2, md: 4 }, py: 3, width: '100%', maxWidth: 1200, mx: 'auto' }}>
    <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
      <Stack spacing={0.5}>
        <Typography variant="h4" fontWeight={700}>
          Orbit Log
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Decode your streaks, lifetime XP, and subject energy in one neon dashboard.
        </Typography>
      </Stack>
      <Chip label="Season 01: Luminous" color="secondary" variant="outlined" sx={{ fontWeight: 600, borderRadius: 999 }} />
    </Stack>
    <InsightsPanel />
  </Stack>
);

export default StatsPage;
