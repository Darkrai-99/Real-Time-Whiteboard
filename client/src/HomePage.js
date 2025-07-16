// HomePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import './HomePage.css';
import { FaInfoCircle, FaChevronDown } from 'react-icons/fa';
import Tooltip from './Tooltip';

const phrases = [
  'Visualize and Build in Real‑Time',
  'Create Boards Together—Instantly',
  'Real‑Time Teamwork, Made Simple',
];

function HomePage() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [roomName, setRoomName] = useState('');
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    setTypingDone(false);
    const timeout = setTimeout(() => setTypingDone(true), 3500);
    return () => clearTimeout(timeout);
  }, [currentLineIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLineIndex((prev) => (prev + 1) % phrases.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = () => {
    if (!roomName.trim()) return alert('Please enter a room name');
    const id = uuidv4();
    navigate(`/room/${id}`, { state: { roomName } });
  };

  const handleJoin = () => {
    if (!roomId.trim()) return alert('Please enter a valid Room ID');
    navigate(`/room/${roomId.trim()}`);
  };

  const visibleText = phrases[currentLineIndex].trim();

  return (
    <div className="home-container">
      <div className="navbar">
        <div className="logo">🧑‍🎨 WhiteboardPro</div>
        <div className="nav-links">
          <div className="dropdown">
            Features <FaChevronDown />
            <div className="dropdown-content">
              <a href="#realtime">Real-Time Sync</a>
              <a href="#download">Download</a>
              <a href="#collab">Collaboration</a>
            </div>
          </div>
          <a href="/pricing">Pricing</a>
          <button className="signin-btn">Sign In</button>
        </div>
      </div>

      <h1
        className={`hero-title typing-title ${!typingDone ? 'typing' : ''}`}
        style={{
          '--char-count': visibleText.length,
          '--target-width': `${visibleText.length}ch`,
        }}
      >
        {visibleText}
        <Tooltip text="Invite friends to draw together live">
          <FaInfoCircle className="info-icon" />
        </Tooltip>
      </h1>

      <div className="button-group">
        <input
          className="join-room-input"
          type="text"
          placeholder="Room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <button className="home-button" onClick={handleCreate}>
          ➕ Create Room
        </button>

        <div className="join-room-container">
          <input
            className="join-room-input"
            type="text"
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button className="home-button" onClick={handleJoin}>
            🔗 Join Room
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
