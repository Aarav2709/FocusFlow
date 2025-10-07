import React from 'react';
import { Stack } from '@mui/material';
import ProfileView from '../views/ProfileView';

const ProfilePage: React.FC = () => {
  return (
    <Stack spacing={3} sx={{ px: { xs: 2, md: 4 }, pt: 1, pb: 4, width: '100%' }}>
      <ProfileView />
    </Stack>
  );
};

export default ProfilePage;
