import { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
import { useProfile } from '../context/ProfileContext';
import { COUNTRIES } from '../constants/countries';

type EditableField = 'nickname' | 'country' | 'status' | null;

const labelMap: Record<Exclude<EditableField, null>, string> = {
  nickname: 'Nickname',
  country: 'Country',
  status: 'Status message'
};

const helperMap: Record<Exclude<EditableField, null>, string> = {
  nickname: 'This name appears across your study groups.',
  country: 'Help friends see where you are studying from.',
  status: 'Share what you are focusing on today.'
};

const ProfileView = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { profile, updateProfile } = useProfile();

  const [nickname, setNickname] = useState(profile?.nickname ?? '');
  const [country, setCountry] = useState(profile?.country ?? COUNTRIES[0]);
  const [status, setStatus] = useState(profile?.status ?? '');

  const [dialogField, setDialogField] = useState<EditableField>(null);
  const [dialogValue, setDialogValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNickname(profile?.nickname ?? '');
    setCountry(profile?.country ?? COUNTRIES[0]);
    setStatus(profile?.status ?? '');
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

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={3} sx={{ width: '100%' }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', color: '#000', fontWeight: 700 }}>
            {initials}
          </Avatar>
          <Stack spacing={0.5}>
            <Typography variant="h5" fontWeight={700}>
              {nickname || 'Add your nickname'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {country}
              {status ? ` • ${status}` : ''}
            </Typography>
          </Stack>
        </Stack>

  <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3, overflow: 'hidden', width: '100%' }}>
          <List disablePadding>
            {(['nickname', 'country', 'status'] as Array<Exclude<EditableField, null>>).map((field, index, array) => (
              <ListItem key={field} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  onClick={() => openDialog(field)}
                  sx={{ py: 1.5, px: 2, display: 'flex', gap: 2, alignItems: 'center' }}
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
                    <Typography variant="body2" color="text.primary" sx={{ maxWidth: 160, textAlign: 'right' }}>
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
          <>
            <DialogTitle>{labelMap[dialogField]}</DialogTitle>
            <DialogContent>
              {dialogField === 'country' ? (
                <TextField
                  select
                  fullWidth
                  label="Country"
                  value={dialogValue}
                  onChange={(event) => setDialogValue(event.target.value)}
                  sx={{ mt: 1 }}
                >
                  {COUNTRIES.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                <TextField
                  fullWidth
                  autoFocus
                  multiline={dialogField === 'status'}
                  minRows={dialogField === 'status' ? 3 : 1}
                  label={labelMap[dialogField]}
                  value={dialogValue}
                  onChange={(event) => setDialogValue(event.target.value)}
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
        ) : null}
      </Dialog>
    </Box>
  );
};

export default ProfileView;
