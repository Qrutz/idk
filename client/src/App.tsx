import { useContext, useState } from 'react';
import './App.css';
import { WebSocketContext } from './components/Layout';

function App() {
  const socket = useContext(WebSocketContext);

  const createGame = () => {
    if (socket) {
      // send json message to server
      socket.send(JSON.stringify({ type: 'create' }));
    }
  };

  return (
    <>
      <button onClick={() => createGame()}>Create</button>
    </>
  );
}

export default App;
