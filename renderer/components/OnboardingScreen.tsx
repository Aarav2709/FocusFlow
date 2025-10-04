import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import { useSnackbar } from 'notistack';
import { useProfile, DEFAULT_DAILY_TARGET_MINUTES } from '../context/ProfileContext';
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
      saveProfile({ nickname: nickname.trim(), country, status: status.trim(), dailyTargetMinutes: DEFAULT_DAILY_TARGET_MINUTES });
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
      <Card sx={{ width: '100%', maxWidth: 520, border: '1px solid rgba(122,108,255,0.25)' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={3.5}>
            <Stack spacing={1.5} alignItems="center" textAlign="center">
              <Chip
                icon={<RocketLaunchIcon fontSize="small" />}
                label="Launch your Focus Lab"
                color="secondary"
                sx={{ fontWeight: 600, borderRadius: 999 }}
              />
              <Typography variant="h5" fontWeight={700}>
                Build your neon study identity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Claim your handle, pick your home base, and start climbing the Focus League.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" justifyContent="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <EmojiEventsIcon fontSize="small" />
                  <Typography variant="caption" color="text.secondary">
                    Unlock badges & daily quests
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <LeaderboardIcon fontSize="small" />
                  <Typography variant="caption" color="text.secondary">
                    Rise through the Focus League
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
            <Stack spacing={2}>
              <TextField
                label="Nickname"
                value={nickname}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNickname(event.target.value)}
                autoFocus
              />
              <TextField
                select
                label="Country"
                value={country}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setCountry(event.target.value)}
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
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setStatus(event.target.value)}
                multiline
                minRows={2}
              />
            </Stack>
            <Button variant="contained" color="inherit" size="large" onClick={handleSubmit} disabled={saving}>
              Enter FocusFlow 2.0
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OnboardingScreen;
