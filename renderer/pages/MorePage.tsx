import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Tune';
import { useNavigate } from 'react-router-dom';

type MoreOption = {
  label: string;
  description: string;
  disabled?: boolean;
  action?: () => void;
};

const MorePage: React.FC = () => {
  const navigate = useNavigate();

  const options = useMemo<MoreOption[]>(
    () => [
      { label: 'Nickname', description: 'Set the name shown in rankings', disabled: true },
      { label: 'Status message', description: 'Share your current mood or goal', disabled: true },
      { label: 'Theme', description: 'Dark theme enabled', disabled: true },
      {
        label: 'Settings',
        description: 'Notification & pomodoro preferences',
        action: () => navigate('/settings')
      },
      { label: 'Region', description: 'Korea', disabled: true },
      { label: 'Language', description: 'English', disabled: true }
    ],
    [navigate]
  );

  return (
    <Stack spacing={3} sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="h4" fontWeight={700}>
          More
        </Typography>
        <SettingsIcon sx={{ color: 'text.secondary' }} />
      </Stack>
      <Card>
        <CardContent>
          <List disablePadding>
            {options.map((option, index) => (
              <ListItem key={option.label} disablePadding divider={index !== options.length - 1}>
                <ListItemButton disabled={option.disabled} onClick={option.action}>
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight={600}>
                        {option.label}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {option.description}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default MorePage;
