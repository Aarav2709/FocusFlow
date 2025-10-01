import React from 'react';
import { Stack } from '@mui/material';
import SettingsView from '../views/SettingsView';

const SettingsPage: React.FC = () => (
  <Stack spacing={4} sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
    <SettingsView />
  </Stack>
);

export default SettingsPage;
