import { createContext } from 'react';

export const ThemeContext = createContext({
  toolbarColor: '#1976d2',
  setToolbarColor: () => {},
  userName: 'Alfredo Giacinti Reyes'
});