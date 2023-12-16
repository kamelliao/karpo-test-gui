import React from 'react';
import { Provider } from 'react-redux';

import { ChakraProvider, theme } from '@chakra-ui/react';

import MainPanel from './components/MainPanel';
import SideBar from './components/Sidebar';
import { store } from './state/store';

function App() {
  return (
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <SideBar />
        <MainPanel />
      </ChakraProvider>
    </Provider>
  );
}

export default App;
