import React, { useRef, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

function Canvas({ roomId, roomName }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [prev, setPrev] = useState({ x: 0, y: 0 });
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [roomDisplayName, setRoomDisplayName] = useState(roomName || '');
  const [darkMode, setDarkMode] = useState(false);
  const [cursors, setCursors] = useState({});

  const clearCanvas = useCallback((emit = false) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    if (emit && roomId) {
      socket.emit('clear', roomId);
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    socket.emit('join-room', { roomId, roomName });

    if (!roomName) {
      socket.emit('request-room-name', roomId);
    }

    const context = canvasRef.current.getContext('2d');

    const handleDraw = ({ x0, y0, x1, y1, color, lineWidth }) => {
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      context.lineCap = 'round';
      context.beginPath();
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.stroke();
    };

    const handleRoomName = (name) => {
      setRoomDisplayName(name);
    };

    const handleCursorMove = ({ socketId, cursor }) => {
      setCursors((prev) => ({
        ...prev,
        [socketId]: cursor
      }));
    };

    const handleRemoveCursor = (socketId) => {
      setCursors((prev) => {
        const newCursors = { ...prev };
        delete newCursors[socketId];
        return newCursors;
      });
    };

    socket.on('draw', handleDraw);
    socket.on('clear', () => clearCanvas(false));
    socket.on('room-name', handleRoomName);
    socket.on('cursor-move', handleCursorMove);
    socket.on('remove-cursor', handleRemoveCursor);

    return () => {
      socket.off('draw', handleDraw);
      socket.off('clear');
      socket.off('room-name', handleRoomName);
      socket.off('cursor-move', handleCursorMove);
      socket.off('remove-cursor', handleRemoveCursor);
    };
  }, [roomId, roomName, clearCanvas]);

  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e) => {
    setDrawing(true);
    setPrev(getMousePos(e));
  };

  const handleMouseUp = () => {
    setDrawing(false);
  };

  const handleMouseMove = (e) => {
    const pos = getMousePos(e);

    // Emit cursor position even if not drawing
    socket.emit('cursor-move', { roomId, cursor: pos });

    if (!drawing) return;

    const { x, y } = pos;
    draw(prev.x, prev.y, x, y, color, lineWidth);
    setPrev({ x, y });
  };

  const draw = (x0, y0, x1, y1, color, lw, emit = true) => {
    const ctx = canvasRef.current.getContext('2d');
    const drawColor = isEraser ? (darkMode ? '#111111' : '#FFFFFF') : color;

    ctx.strokeStyle = drawColor;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    if (emit && roomId) {
      socket.emit('draw', {
        roomId,
        data: { x0, y0, x1, y1, color: drawColor, lineWidth: lw },
      });
    }
  };

  const getCursorStyle = (pos) => ({
    position: 'absolute',
    left: `${pos.x}px`,
    top: `${pos.y}px`,
    background: 'rgba(0, 0, 0, 0.6)',
    color: 'white',
    padding: '2px 6px',
    fontSize: '12px',
    borderRadius: '4px',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    zIndex: 10,
  });

  return (
    <div style={{ textAlign: 'center' }}>
      <h2 className="text-2xl font-bold p-4">🧑‍🤝‍🧑 Room: {roomDisplayName}</h2>

      <div style={{ marginBottom: '10px' }}>
        <label>🎨 Color: </label>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <label style={{ marginLeft: '20px' }}>🖌️ Size: </label>
        <input
          type="range"
          min="1"
          max="20"
          value={lineWidth}
          onChange={(e) => setLineWidth(parseInt(e.target.value))}
        />
        <button onClick={() => clearCanvas(true)}>🧹 Clear Canvas</button>
        <button onClick={() => setIsEraser((prev) => !prev)} style={{ marginLeft: '20px' }}>
          {isEraser ? '🖌️ Drawing Mode' : '🧽 Eraser Mode'}
        </button>
        <button onClick={() => setDarkMode(prev => !prev)} style={{ marginLeft: '20px' }}>
          {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <div style={{ position: 'relative', display: 'inline-block' }}>
        <canvas
          ref={canvasRef}
          width={1100}
          height={600}
          style={{
            border: '4px solid #444',
            borderRadius: '12px',
            backgroundColor: darkMode ? '#111' : '#fff',
            cursor: isEraser ? 'cell' : 'crosshair'
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        />
        {/* Render each user’s cursor */}
        {Object.entries(cursors).map(([id, pos]) => (
          <div key={id} style={getCursorStyle(pos)}>
            👤 {id.slice(0, 4)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Canvas;
