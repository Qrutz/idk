import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { WebSocketContext } from '../components/Layout';

interface LobbyParams {
  id: string;
}

export default function Lobby() {
  const { id } = useParams<LobbyParams>();
  const { send, messages } = useContext(WebSocketContext);
  const [playerName, setPlayerName] = useState('');
  const [isNameSubmitted, setIsNameSubmitted] = useState(false); // New state to track if the name has been submitted
  const inviteLink = `${window.location.origin}/lobby/${id}`;

  // Handle the form submission, send the join message
  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the form from submitting in the traditional way
    if (playerName.trim()) {
      send({ type: 'join', room: id, name: playerName });
      setIsNameSubmitted(true); // Set name as submitted after sending join request
    }
  };

  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    if (
      latestMessage &&
      latestMessage.type === 'status' &&
      latestMessage.message === 'Your turn to choose'
    ) {
      console.log('Pick heads or tails');
    }
  }, [messages]);

  return (
    <div className='flex flex-col items-center justify-center p-4'>
      <h1>COINTOSSSHIT</h1>

      {!isNameSubmitted && ( // Check if name is submitted before hiding form
        <form onSubmit={handleJoin} className='flex flex-col items-center'>
          <input
            type='text'
            placeholder='Enter your name'
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className='mb-2 p-2 border'
          />
          <button
            type='submit'
            className='bg-blue-500 text-white px-4 py-2 rounded'
          >
            Join Game
          </button>
        </form>
      )}

      {messages[messages.length - 1]?.type === 'status' &&
        messages[messages.length - 1]?.message ===
          'Waiting for another player...' && (
          <p>
            Share this link to invite the second player:{' '}
            <a href={inviteLink} target='_blank' rel='noopener noreferrer'>
              {inviteLink}
            </a>
          </p>
        )}

      {messages[messages.length - 1]?.type === 'result' && (
        <p>
          {messages[messages.length - 1].win === true
            ? 'You won sir'
            : 'You lost sir'}
        </p>
      )}

      {messages[messages.length - 1]?.type === 'status' &&
        messages[messages.length - 1]?.message === 'Your turn to choose' && (
          <div className='flex flex-col items-center'>
            {' '}
            {/* Display heads or tails buttons */}
            <button
              className='bg-blue-500 text-white px-4 py-2 rounded'
              onClick={() =>
                send({ type: 'choice', room: id, choice: 'heads' })
              }
            >
              Heads
            </button>
            <button
              className='bg-blue-500 text-white px-4 py-2 rounded'
              onClick={() =>
                send({ type: 'choice', room: id, choice: 'tails' })
              }
            >
              Tails
            </button>
          </div>
        )}

      {/* Display game status based on WebSocket messages */}
      {messages[messages.length - 1]?.type === 'status' && (
        <p>{messages[messages.length - 1].message}</p>
      )}
    </div>
  );
}
