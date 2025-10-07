import React from 'react';
import { Stack } from '@mui/material';
import AchievementsView from '../views/AchievementsView';

const AchievementsPage: React.FC = () => (
  <Stack spacing={3} sx={{ px: { xs: 2, md: 4 }, pt: 1, pb: 4, width: '100%' }}>
    <AchievementsView />
  </Stack>
);

export default AchievementsPage;
