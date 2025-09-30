import { Box, Heading, Text, Flex, FlexProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface StatCardProps extends FlexProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: string;
}

export const StatCard = ({ title, value, icon, trend, ...rest }: StatCardProps) => (
  <Flex
    direction="column"
    bg="rgba(32, 35, 45, 0.8)"
    border="1px solid rgba(255,255,255,0.05)"
    rounded="2xl"
    p={5}
    gap={4}
    shadow="xl"
    {...rest}
  >
    <Flex align="center" gap={3}>
      {icon && <Box color="brand.400">{icon}</Box>}
      <Text fontSize="sm" color="gray.400" textTransform="uppercase" letterSpacing={1.2}>
        {title}
      </Text>
    </Flex>
    <Heading size="lg">{value}</Heading>
    {trend && (
      <Text fontSize="sm" color="green.300">
        {trend}
      </Text>
    )}
  </Flex>
);

export default StatCard;
