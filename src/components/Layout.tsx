import { Box, Flex } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import NavigationBar from './NavigationBar';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => (
  <Flex direction="column" minH="100vh" bgGradient="linear(180deg, #0f1117 0%, #05060a 100%)" px={4} py={4} gap={4}>
    <Box flex="1" overflowY="auto" px={1}>
      {children}
    </Box>
    <NavigationBar />
  </Flex>
);

export default Layout;
