import React from 'react';
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

const options = [
  { label: 'Nickname', description: 'Set the name shown in rankings' },
  { label: 'Status message', description: 'Share your current mood or goal' },
  { label: 'Theme', description: 'Dark theme enabled', disabled: true },
  { label: 'Settings', description: 'Notification & pomodoro preferences' },
  { label: 'Region', description: 'Korea' },
  { label: 'Language', description: 'English' }
];

const MorePage: React.FC = () => (
  <Stack spacing={3} sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
    <Typography variant="h4" fontWeight={700}>
      More
    </Typography>
    <Card sx={{ borderRadius: 4 }}>
      <CardContent>
        <List disablePadding>
          {options.map((option, index) => (
            <ListItem key={option.label} disablePadding divider={index !== options.length - 1}>
              <ListItemButton disabled={option.disabled} sx={{ borderRadius: 3 }}>
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

export default MorePage;
