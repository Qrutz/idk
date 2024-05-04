import { useEffect } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from './hooks/useWebSocket';
import CoinToss from './components/CoinToss';
import { motion } from 'framer-motion';

function App() {
  const { send, messages } = useWebSocket();
  const navigate = useNavigate();

  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    if (latestMessage && latestMessage.type === 'room_created') {
      console.log('Latest message:', latestMessage);
      navigate(`/lobby/${latestMessage.room}`);
    }
  }, [messages, navigate]);

  const createGame = () => {
    send({ type: 'create' });
  };

  return (
    <>
      <button onClick={() => createGame()}>Create Game</button>
    </>
  );
}

export default App;
