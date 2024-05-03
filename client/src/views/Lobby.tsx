import React, { useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WebSocketContext } from '../components/Layout';

interface LobbyParams {
  id: string;
}

export default function Lobby() {
  const { id } = useParams<LobbyParams>();
  const navigate = useNavigate();
  const { send, messages } = useContext(WebSocketContext);
  const [player2hasJoined, setPlayer2hasJoined] = React.useState(false);
  const inviteLink = `${window.location.origin}/lobby/${id}`;

  // Effect for sending the initial join message
  useEffect(() => {
    // Send join message for player1
    send({ type: 'join', room: id, name: 'player1' });
  }, []); // Only re-run if `id` or `send` changes

  //   useEffect(() => {
  //     const latestMessage = messages[messages.length - 1];
  //     if (
  //       latestMessage &&
  //       latestMessage.type === 'join' &&
  //       latestMessage.name !== 'player1'
  //     ) {
  //       console.log('Player 2 has prolly joined:', latestMessage);
  //       setPlayer2hasJoined(true);
  //     }
  //   }, [messages]);

  return (
    <div className='flex flex-col'>
      <span className='flex gap-2'>
        <h1>COINTOSSSHIT</h1>
        <h2>Room ID: {id}</h2>
      </span>

      <p>
        Share this link to invite the second player:{' '}
        <a href={inviteLink}>{inviteLink}</a>
      </p>
      {player2hasJoined ? (
        <p>Player 2 has joined. Starting game...</p>
      ) : (
        <p>Waiting for Player 2 to join...</p>
      )}
    </div>
  );
}
