import { createContext } from 'react';

export const ThemeContext = createContext({
  toolbarColor: '#d35400',
  setToolbarColor: () => {},
  userName: 'Alfredo Giacinti Reyes',
  setUserName: () => {},
  palette: { bg: '#ffffff', primary: '#d35400', text: '#333333' },
  registeredUser: null,
  setRegisteredUser: () => {},
  authenticated: false,
  setAuthenticated: () => {},
  isAdmin: false,
  setIsAdmin: () => {},
  userProfile: null,
  setUserProfile: () => {}
});