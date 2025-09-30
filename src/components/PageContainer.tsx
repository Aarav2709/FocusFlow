import { Box, Heading, Text, Stack, StackProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface PageContainerProps extends StackProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export const PageContainer = ({
  title,
  description,
  actions,
  children,
  ...stackProps
}: PageContainerProps) => (
  <Stack spacing={6} {...stackProps}>
    <Stack direction="row" align="flex-start" justify="space-between" spacing={4}>
      <Box>
        <Heading size="lg">{title}</Heading>
        {description && (
          <Text color="gray.400" mt={2} fontSize="sm">
            {description}
          </Text>
        )}
      </Box>
      {actions && <Box>{actions}</Box>}
    </Stack>
    <Box>{children}</Box>
  </Stack>
);

export default PageContainer;
