import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useProfile } from '../context/ProfileContext';
import { COUNTRIES } from '../constants/countries';

const OnboardingScreen = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { saveProfile } = useProfile();
  const [nickname, setNickname] = useState('');
  const [country, setCountry] = useState('India');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!nickname.trim()) {
      enqueueSnackbar('Please choose a nickname to continue.', { variant: 'warning' });
      return;
    }
    setSaving(true);
    try {
      saveProfile({ nickname: nickname.trim(), country, status: status.trim() });
      enqueueSnackbar('Welcome aboard! Time to focus.', { variant: 'success' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 4
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 480 }}>
        <CardContent>
          <Stack spacing={3}>
            <Stack spacing={1} alignItems="center">
              <CircularProgress color="inherit" size={40} />
              <Typography variant="h5" fontWeight={700} textAlign="center">
                Getting your study space ready
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Set up your profile so your friends know who is topping the charts.
              </Typography>
            </Stack>
            <Stack spacing={2}>
              <TextField
                label="Nickname"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                autoFocus
              />
              <TextField
                select
                label="Country"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
              >
                {COUNTRIES.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Status message"
                placeholder="Share what you're focusing on"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                multiline
                minRows={2}
              />
            </Stack>
            <Button variant="contained" color="inherit" size="large" onClick={handleSubmit} disabled={saving}>
              Start studying
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OnboardingScreen;
