import React, { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  Stack,
  TextField,
  Typography,
  MenuItem
} from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useSnackbar } from 'notistack';
import { useProfile, DEFAULT_DAILY_TARGET_MINUTES } from '../context/ProfileContext';
import { useStudy } from '../context/StudyContext';
import { COUNTRIES } from '../constants/countries';

type EditableField = 'nickname' | 'country' | 'status' | 'dailyTargetMinutes' | null;

const labelMap: Record<Exclude<EditableField, null>, string> = {
  nickname: 'Nickname',
  country: 'Country',
  status: 'Status message',
  dailyTargetMinutes: 'Daily focus target'
};

const helperMap: Record<Exclude<EditableField, null>, string> = {
  nickname: 'This name appears across your study groups.',
  country: 'Help friends see where you are studying from.',
  status: 'Share what you are focusing on today.',
  dailyTargetMinutes: 'Set your daily focus goal in minutes.'
};

const XP_PER_MINUTE = 12;

type HistoryEntry = { focusSeconds: number; breakSeconds: number; perSubject: Record<string, number> };

const computeLevel = (xp: number) => {
  let level = 1;
  let remainingXp = xp;
  let xpForLevel = 240;

  while (remainingXp >= xpForLevel) {
    remainingXp -= xpForLevel;
    level += 1;
    xpForLevel = Math.round(240 + level * 180);
  }

  const progress = xpForLevel === 0 ? 1 : Math.min(1, remainingXp / xpForLevel);

  return {
    level,
    xpIntoLevel: remainingXp,
    xpForNext: xpForLevel,
    progress
  };
};

const tierFromLevel = (level: number) => {
  if (level >= 12) return 'Supernova Strategist';
  if (level >= 9) return 'Nebula Mentor';
  if (level >= 6) return 'Aurora Scholar';
  if (level >= 3) return 'Orbit Keeper';
  return 'Focus Initiate';
};

const computeStreak = (history: Record<string, HistoryEntry>) => {
  const keys = Object.keys(history);
  if (!keys.length) return 0;
  let streak = 0;
  const cursor = new Date();
  while (streak <= keys.length) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    const entry = history[key];
    if (!entry || entry.focusSeconds <= 0) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

const ProfileView = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { profile, updateProfile } = useProfile();
  const { history, totalFocusSeconds } = useStudy();

  const [nickname, setNickname] = useState(profile?.nickname ?? '');
  const [country, setCountry] = useState(profile?.country ?? COUNTRIES[0]);
  const [status, setStatus] = useState(profile?.status ?? '');
  const [dailyTarget, setDailyTarget] = useState(profile?.dailyTargetMinutes ?? DEFAULT_DAILY_TARGET_MINUTES);

  const [dialogField, setDialogField] = useState<EditableField>(null);
  const [dialogValue, setDialogValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNickname(profile?.nickname ?? '');
    setCountry(profile?.country ?? COUNTRIES[0]);
    setStatus(profile?.status ?? '');
    setDailyTarget(profile?.dailyTargetMinutes ?? DEFAULT_DAILY_TARGET_MINUTES);
  }, [profile]);

  const initials = useMemo(() => {
    if (nickname.trim()) return nickname.trim().slice(0, 2).toUpperCase();
    return 'YOU';
  }, [nickname]);

  const openDialog = (field: Exclude<EditableField, null>) => {
    setDialogField(field);
    if (field === 'nickname') {
      setDialogValue(nickname);
    } else if (field === 'country') {
      setDialogValue(country);
    } else if (field === 'dailyTargetMinutes') {
      setDialogValue(String(dailyTarget));
    } else {
      setDialogValue(status);
    }
  };

  const closeDialog = () => {
    setDialogField(null);
    setDialogValue('');
  };

  const fieldDisplay = (field: Exclude<EditableField, null>) => {
    if (field === 'nickname') return nickname || 'Add nickname';
    if (field === 'country') return country;
    if (field === 'dailyTargetMinutes') return `${dailyTarget} min`;
    return status || 'Add status';
  };

  const handleSave = async () => {
    if (!dialogField) return;
    const trimmed = dialogValue.trim();

    if (dialogField === 'nickname' && !trimmed) {
      enqueueSnackbar('Nickname cannot be empty.', { variant: 'warning' });
      return;
    }

    setSaving(true);
    try {
      if (dialogField === 'nickname') {
        setNickname(trimmed);
        updateProfile({ nickname: trimmed });
      } else if (dialogField === 'country') {
        setCountry(dialogValue);
        updateProfile({ country: dialogValue });
      } else if (dialogField === 'dailyTargetMinutes') {
        const numericValue = Number(dialogValue);
        if (Number.isNaN(numericValue) || numericValue <= 0) {
          enqueueSnackbar('Please enter a valid positive number of minutes.', { variant: 'warning' });
          setSaving(false);
          return;
        }
        const minutes = Math.min(1440, Math.round(numericValue));
        setDailyTarget(minutes);
        updateProfile({ dailyTargetMinutes: minutes });
      } else {
        setStatus(trimmed);
        updateProfile({ status: trimmed });
      }
      enqueueSnackbar('Profile updated.', { variant: 'success' });
      closeDialog();
    } finally {
      setSaving(false);
    }
  };

  const lifetimeFocusSeconds = Object.values(history as Record<string, HistoryEntry>).reduce(
    (acc, entry) => acc + entry.focusSeconds,
    0
  );
  const lifetimeMinutes = Math.max(Math.round(lifetimeFocusSeconds / 60), Math.round(totalFocusSeconds / 60));
  const totalXp = lifetimeMinutes * XP_PER_MINUTE;
  const { level, xpForNext, xpIntoLevel, progress } = computeLevel(totalXp);
  const tier = tierFromLevel(level);
  const streak = computeStreak(history as Record<string, HistoryEntry>);
  const xpToNext = Math.max(xpForNext - xpIntoLevel, 0);

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={3} sx={{ width: '100%' }}>
        <Card sx={{ border: '1px solid rgba(122,108,255,0.25)' }}>
          <CardContent sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'center' }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'secondary.main', color: '#050217', fontWeight: 700 }}>
                {initials}
              </Avatar>
              <Stack spacing={0.75}>
                <Typography variant="h5" fontWeight={700}>
                  {nickname || 'Add your nickname'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {country}
                  {status ? ` • ${status}` : ''}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={`Lv ${level}`} color="secondary" sx={{ fontWeight: 600 }} />
                  <Chip label={tier} variant="outlined" sx={{ fontWeight: 600, borderRadius: 999 }} />
                </Stack>
              </Stack>
            </Stack>
            <Stack spacing={1.25} sx={{ width: { xs: '100%', md: 280 } }}>
              <Typography variant="subtitle2" color="text.secondary">
                Next unlock in {xpToNext} XP
              </Typography>
              <LinearProgress variant="determinate" value={Math.round(progress * 100)} />
              <Stack direction="row" spacing={3}>
                <Stack>
                  <Typography variant="caption" color="text.secondary">
                    Lifetime XP
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {totalXp.toLocaleString()} XP
                  </Typography>
                </Stack>
                <Stack>
                  <Typography variant="caption" color="text.secondary">
                    Streak
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {streak} day{streak === 1 ? '' : 's'}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 6, overflow: 'hidden', width: '100%' }}>
          <List disablePadding>
            {(['nickname', 'country', 'status', 'dailyTargetMinutes'] as Array<Exclude<EditableField, null>>).map((field, index, array) => (
              <ListItem key={field} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  onClick={() => openDialog(field)}
                  sx={{ py: 1.5, px: 2.5, display: 'flex', gap: 2, alignItems: 'center' }}
                >
                  <Stack spacing={0.25} sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {labelMap[field]}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {helperMap[field]}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.primary" sx={{ maxWidth: 200, textAlign: 'right' }}>
                      {fieldDisplay(field)}
                    </Typography>
                    <KeyboardArrowRightIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                  </Stack>
                </ListItemButton>
                {index < array.length - 1 ? <Divider component="div" /> : null}
              </ListItem>
            ))}
          </List>
        </Box>
      </Stack>

      <Dialog open={Boolean(dialogField)} onClose={closeDialog} fullWidth maxWidth="xs">
        {dialogField ? (
          (() => {
            const field = dialogField as Exclude<EditableField, null>;
            return (
              <>
                <DialogTitle>{labelMap[field]}</DialogTitle>
                <DialogContent>
                  {field === 'country' ? (
                    <TextField
                      select
                      fullWidth
                      label="Country"
                      value={dialogValue}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDialogValue(event.target.value)}
                      sx={{ mt: 1 }}
                    >
                      {COUNTRIES.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  ) : field === 'dailyTargetMinutes' ? (
                    <TextField
                      fullWidth
                      autoFocus
                      type="number"
                      label="Daily focus target (minutes)"
                      value={dialogValue}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDialogValue(event.target.value)}
                      sx={{ mt: 1 }}
                      inputProps={{ min: 1, max: 1440, step: 5 }}
                    />
                  ) : (
                    <TextField
                      fullWidth
                      autoFocus
                      multiline={field === 'status'}
                      minRows={field === 'status' ? 3 : 1}
                      label={labelMap[field]}
                      value={dialogValue}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDialogValue(event.target.value)}
                      sx={{ mt: 1 }}
                    />
                  )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                  <Button onClick={closeDialog} color="inherit">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} variant="contained" color="inherit" disabled={saving}>
                    Save
                  </Button>
                </DialogActions>
              </>
            );
          })()
        ) : null}
      </Dialog>
    </Box>
  );
};

export default ProfileView;
