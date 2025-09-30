import { Flex, Icon, Button } from '@chakra-ui/react';
import {
  EditIcon,
  CheckCircleIcon,
  RepeatIcon,
  TimeIcon,
  ViewIcon,
  SettingsIcon
} from '@chakra-ui/icons';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { PageKey } from '@state/types';

const navItems: Array<{ key: PageKey; label: string; icon: typeof EditIcon }> = [
  { key: 'notes', label: 'Notes', icon: EditIcon },
  { key: 'tasks', label: 'Tasks', icon: CheckCircleIcon },
  { key: 'flashcards', label: 'Cards', icon: RepeatIcon },
  { key: 'timer', label: 'Timer', icon: TimeIcon },
  { key: 'progress', label: 'Progress', icon: ViewIcon },
  { key: 'settings', label: 'Settings', icon: SettingsIcon }
];

const routeForPage = (page: PageKey) => `/${page}`;

export const NavigationBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = useCallback(
    (page: PageKey) => {
      navigate(routeForPage(page));
    },
    [navigate]
  );

  return (
    <Flex as="nav" bg="rgba(22,22,26,0.9)" backdropFilter="blur(16px)" px={2} py={3} gap={2} rounded="xl" shadow="lg">
      {navItems.map((item) => {
        const href = routeForPage(item.key);
        const isActive = location.pathname === href;
        return (
          <Button
            key={item.key}
            flex="1"
            variant={isActive ? 'solid' : 'ghost'}
            leftIcon={<Icon as={item.icon} boxSize={4} />}
            onClick={() => handleNavigate(item.key)}
            height={12}
          >
            {item.label}
          </Button>
        );
      })}
    </Flex>
  );
};

export default NavigationBar;
