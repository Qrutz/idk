import { useContext, useEffect } from 'react';
import './App.css';
import { WebSocketContext } from './components/Layout';
import { useNavigate } from 'react-router-dom';

function App() {
  const { send, messages } = useContext(WebSocketContext);
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
