import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import SocketConnection from './components/Layout.tsx';
import Lobby from './views/Lobby.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/lobby/:id',
    element: <Lobby />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <SocketConnection>
    <RouterProvider router={router} />
  </SocketConnection>
);
