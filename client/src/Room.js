// Room.js
import { useParams, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Canvas from './canvas';
import './Room.css';

const socket = io('http://localhost:3001');

export default function Room() {
  const { roomId } = useParams();
  const location = useLocation();

  const initialName = location.state?.roomName;
  const [roomName, setRoomName] = useState(initialName || '');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Join and request name on mount
    socket.emit('join-room', { roomId, roomName: initialName });
    socket.on('room-name', setRoomName);
    socket.emit('request-room-name', roomId);

    return () => {
      socket.off('room-name', setRoomName);
    };
  }, [roomId, initialName]);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="room-page">
      <header className="navbar">
        <div className="navbar-left">
          <span className="navbar-logo">🧑‍🤝‍🧑 Whiteboard</span>
        </div>
        <div className="navbar-right">
          <div className="room-id-box">
            <span className="room-id-label">Room ID:</span>
            <code className="room-id-code">{roomId}</code>
            <button className="copy-btn" onClick={copyRoomId}>
              {copied ? '✔ Copied' : '📋 Copy'}
            </button>
          </div>
          <div className="room-avatar">{roomName?.[0]?.toUpperCase() || 'U'}</div>
        </div>
      </header>

      <section className="room-info-section">
        <h1 className="room-heading">
          Welcome to <span>{roomName || 'Untitled'}</span>
        </h1>
      </section>

      <main className="room-canvas-area">
        <Canvas roomId={roomId} roomName={roomName} />
      </main>
    </div>
  );
}

