import { Card, CardContent, Stack, Typography } from '@mui/material';

const SettingsView = () => (
  <Stack spacing={3}>
    <Stack spacing={0.5}>
      <Typography variant="h4" fontWeight={700}>
        Settings
      </Typography>
      <Typography variant="body2" color="text.secondary">
        All preferences now live in the More tab. Check back here for future updates.
      </Typography>
    </Stack>
    <Card>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          There are no additional settings available at the moment.
        </Typography>
      </CardContent>
    </Card>
  </Stack>
);

export default SettingsView;
