import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useProfile } from '../context/ProfileContext';
import { useAppState } from '../context/AppStateContext';
import { useStudy } from '../context/StudyContext';
import { COUNTRIES } from '../constants/countries';

const SettingsView = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { profile, updateProfile } = useProfile();
  const { preferences, updatePreference } = useAppState();
  const { totalFocusSeconds, breakSeconds } = useStudy();

  const [nickname, setNickname] = useState(profile?.nickname ?? '');
  const [country, setCountry] = useState(profile?.country ?? COUNTRIES[0]);
  const [status, setStatus] = useState(profile?.status ?? '');
  const [saving, setSaving] = useState(false);
  const [pendingNotification, setPendingNotification] = useState(false);

  useEffect(() => {
    setNickname(profile?.nickname ?? '');
    setCountry(profile?.country ?? COUNTRIES[0]);
    setStatus(profile?.status ?? '');
  }, [profile]);

  const focusHours = useMemo(() => Math.round(totalFocusSeconds / 360) / 10, [totalFocusSeconds]);
  const breakHours = useMemo(() => Math.round(breakSeconds / 360) / 10, [breakSeconds]);

  const handleSaveProfile = async () => {
    if (!nickname.trim()) {
      enqueueSnackbar('Nickname is required.', { variant: 'warning' });
      return;
    }
    setSaving(true);
    try {
      updateProfile({ nickname: nickname.trim(), country, status: status.trim() });
      enqueueSnackbar('Profile updated.', { variant: 'success' });
    } finally {
      setSaving(false);
    }
  };

  const handleNotifications = async (_: unknown, checked: boolean) => {
    setPendingNotification(true);
    try {
      await updatePreference('notificationsEnabled', checked);
      enqueueSnackbar(checked ? 'Notifications enabled.' : 'Notifications disabled.', { variant: 'info' });
    } finally {
      setPendingNotification(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h4" fontWeight={700}>
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Keep your profile and study preferences in sync across every device.
        </Typography>
      </Stack>

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight={600}>
              Profile
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nickname"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Country"
                  select
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                >
                  {COUNTRIES.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Status message"
                  placeholder="Let others know what you're focused on"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  multiline
                  minRows={3}
                />
              </Grid>
            </Grid>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" color="inherit" onClick={handleSaveProfile} disabled={saving}>
                Save profile
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight={600}>
              Focus & notifications
            </Typography>
            <FormControlLabel
              label="Enable desktop notifications"
              control={
                <Switch
                  checked={Boolean(preferences?.notificationsEnabled)}
                  onChange={handleNotifications}
                  disabled={pendingNotification}
                />
              }
            />
            <Typography variant="caption" color="text.secondary">
              Get a gentle reminder when a focus block finishes so breaks don&apos;t run over.
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight={600}>
              Lifetime stats
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} divider={<Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' }, borderColor: 'rgba(255,255,255,0.08)' }} />}>
              <Stack>
                <Typography variant="overline" color="text.secondary">
                  FOCUS HOURS
                </Typography>
                <Typography variant="h4" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {focusHours.toFixed(1)}h
                </Typography>
              </Stack>
              <Stack>
                <Typography variant="overline" color="text.secondary">
                  BREAK HOURS
                </Typography>
                <Typography variant="h4" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {breakHours.toFixed(1)}h
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default SettingsView;
