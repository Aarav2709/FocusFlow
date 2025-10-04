import React from 'react';
import { Stack } from '@mui/material';
import QuestsView from '@views/QuestsView';

const QuestsPage: React.FC = () => (
  <Stack spacing={3} sx={{ px: { xs: 1.5, md: 0 }, pb: 4, width: '100%' }}>
    <QuestsView />
  </Stack>
);

export default QuestsPage;
