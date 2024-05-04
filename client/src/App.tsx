import { useEffect } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from './hooks/useWebSocket';

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
      <button onClick={() => createGame()}>Create</button>
    </>
  );
}

export default App;
