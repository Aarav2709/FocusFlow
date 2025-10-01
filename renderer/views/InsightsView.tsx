import React, { useMemo } from 'react';
import { Box, Divider, Stack, Typography } from '@mui/material';

type Subject = { id: string; name: string; color?: string };

const SUBJECT_KEY = 'ypt:subjects:v1';
const ELAPSED_KEY = 'ypt:elapsed:v1';

function readSubjects(): Subject[] {
  try {
    const raw = localStorage.getItem(SUBJECT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Subject[];
  } catch {
    return [];
  }
}

function readElapsed(): Record<string, number> {
  try {
    const raw = localStorage.getItem(ELAPSED_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {};
  }
}

const InsightsView: React.FC = () => {
  const subjects = useMemo(() => readSubjects(), []);
  const elapsed = useMemo(() => readElapsed(), []);

  const totalMinutes = Math.round(Object.values(elapsed).reduce((a, b) => a + b, 0) / 60);

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h4" fontWeight={700}>Insights</Typography>
      </Box>

      <Box>
        <Typography variant="body2">Total time: {totalMinutes} min</Typography>
        <Typography variant="body2">Daily avg: {Math.round(totalMinutes / 7)} min</Typography>
      </Box>

      <Divider />

      <Stack spacing={1}>
        {subjects.map((s) => {
          const mins = Math.round((elapsed[s.id] ?? 0) / 60);
          const pct = totalMinutes > 0 ? Math.round((mins / totalMinutes) * 100) : 0;
          return (
            <Box key={s.id}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">{s.name}</Typography>
                <Typography variant="body2">{mins}m</Typography>
              </Stack>
              <Box sx={{ height: 8, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 1, mt: 0.5 }}>
                <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: s.color ?? '#999', borderRadius: 1 }} />
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );
};

export default InsightsView;
