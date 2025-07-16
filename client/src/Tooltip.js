import React, { useState } from 'react';
import './Tooltip.css';

export default function Tooltip({ children, text }) {
  const [hover, setHover] = useState(false);
  return (
    <span
      className="tooltip-wrapper"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
      {hover && <div className="tooltip-box">{text}</div>}
    </span>
  );
}
