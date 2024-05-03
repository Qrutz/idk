// src/components/Layout.tsx
import React, { useEffect, useState, createContext, ReactNode } from 'react';

// Define the type for the WebSocket context
type WebSocketContextType = WebSocket | null;

// Create WebSocket context with TypeScript
export const WebSocketContext = createContext<WebSocketContextType>(null);

interface LayoutProps {
  children?: ReactNode;
}

const SocketConnection: React.FC<LayoutProps> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    console.log('Connecting to WebSocket...');
    const newSocket = new WebSocket('ws://localhost:6789');

    newSocket.onopen = () => {
      console.log('WebSocket connection established');
    };

    newSocket.onmessage = (message: MessageEvent) => {
      console.log('Received message: ', message.data);
    };

    newSocket.onerror = (event: Event) => {
      if (event instanceof ErrorEvent) {
        console.error('WebSocket error:', event.message);
      } else {
        console.error('WebSocket error occurred:', event);
      }
    };

    newSocket.onclose = () => {
      console.log('WebSocket connection closed');
      setSocket(null); // Ensure to handle retry or inform user
    };

    setSocket(newSocket);

    return () => {
      if (newSocket.readyState === 1) {
        newSocket.close();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default SocketConnection;
