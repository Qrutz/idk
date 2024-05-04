// src/components/Layout.tsx
import React, { useEffect, useState, createContext, ReactNode } from 'react';

// Define the type for the WebSocket context
type WebSocketContextType = {
  socket: WebSocket | null;
  messages: Message[];
  send: (data: string | object) => void;
};

type Message = {
  outcome: boolean;
  type: string;
  room?: string;
  message?: string;
  win?: boolean;
};

// Create WebSocket context with TypeScript
export const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

interface LayoutProps {
  children?: ReactNode;
}

const SocketConnection: React.FC<LayoutProps> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  // track game lobby responses, move to zustand or some shit later
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    console.log('Connecting to WebSocket...');
    const newSocket = new WebSocket('ws://95.141.241.150:6789');

    newSocket.onopen = () => {
      console.log('WebSocket connection established');
    };

    newSocket.onmessage = (message: MessageEvent) => {
      console.log('Received message: ', message.data);
      const messageResponse = JSON.parse(message.data);
      setMessages((prev) => [...prev, messageResponse]);
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

  const send = (data: string | object) => {
    if (socket) {
      socket.send(JSON.stringify(data));
    }
  };

  return (
    <WebSocketContext.Provider value={{ socket, messages, send }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default SocketConnection;
