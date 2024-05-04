import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import heads from '../assets/heads.png';
import tails from '../assets/tails2.png';
import { motion } from 'framer-motion';
import Coin from '../components/Coin';
import ClickToCopy from '../components/InviteLinkComponent';

export default function Lobby() {
  const { id } = useParams();
  const { send, messages } = useWebSocket();
  const [playerName, setPlayerName] = useState('');
  const [isNameSubmitted, setIsNameSubmitted] = useState(false); // New state to track if the name has been submitted
  const inviteLink = `${window.location.origin}/lobby/${id}`;
  const navigate = useNavigate();

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
          <div className='flex flex-col gap-2'>
            <h2 className='text-3xl'>
              {' '}
              Share this link to invite the second player:{' '}
            </h2>
            <ClickToCopy link={inviteLink} />
          </div>
        )}

      {messages[messages.length - 1]?.type === 'result' && (
        <div className='flex flex-col gap-2'>
          <p>
            {messages[messages.length - 1].win === true
              ? 'You won sir'
              : 'You lost sir'}
          </p>

          <button
            className='bg-blue-500 text-white px-4 py-2 rounded'
            onClick={() => navigate('/')}
          >
            EXIT
          </button>
        </div>
      )}

      {messages[messages.length - 1]?.type === 'status' &&
        messages[messages.length - 1]?.message === 'Your turn to choose' && (
          <div className='flex gap-4 items-center'>
            {' '}
            {/* Display heads or tails buttons */}
            <Coin
              onClick={() => {
                send({ type: 'choice', room: id, choice: 'heads' });
              }}
              Image={heads}
            />
            <Coin
              onClick={() => {
                send({ type: 'choice', room: id, choice: 'tails' });
              }}
              Image={tails}
            />
          </div>
        )}

      {/* Display game status based on WebSocket messages */}
      {messages[messages.length - 1]?.type === 'status' && (
        <p className=''>{messages[messages.length - 1].message}</p>
      )}
    </div>
  );
}
