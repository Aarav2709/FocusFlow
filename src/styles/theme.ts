import { extendTheme, ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false
};

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: '#e3f2ff',
      100: '#b8dcff',
      200: '#8bc6ff',
      300: '#5dafef',
      400: '#3299e6',
      500: '#1a80cc',
      600: '#105fa0',
      700: '#084073',
      800: '#022247',
      900: '#000e1d'
    }
  },
  styles: {
    global: {
      body: {
        bg: '#0f1117',
        color: 'gray.100',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      },
      '*': {
        boxSizing: 'border-box'
      }
    }
  },
  components: {
    Button: {
      baseStyle: {
        rounded: 'lg',
        fontWeight: 'semibold'
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: { bg: 'brand.400' },
          _active: { bg: 'brand.600' }
        }
      }
    },
    Input: {
      baseStyle: {
        field: {
          bg: 'gray.800',
          borderColor: 'gray.700'
        }
      }
    },
    Textarea: {
      baseStyle: {
        bg: 'gray.800',
        borderColor: 'gray.700'
      }
    }
  }
});

export default theme;
