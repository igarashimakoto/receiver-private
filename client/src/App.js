import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import AppRouter from './routes/routes'


const App = () => {
  return (
    <ChakraProvider>
      <AppRouter/>  
    </ChakraProvider>
  );
}

export default App;
