import React from 'react';

const LinearSpeedometer = ({
  speed = 50,
  maxSpeed = 100,
  tickCount = 9,
  width = 300,
  height = 20,
  backgroundColor = '#333',
  tickColor = '#111',
  tickHeight = 5,
  tickWidth = 1
}) => {
  // Ensure speed does not exceed maxSpeed or drop below 0
  const currentSpeed = Math.max(0, Math.min(speed, maxSpeed));
  
  // Calculate the percentage of the bar that should be filled
  const fillPercentage = (currentSpeed / maxSpeed) * 100;

  // Create an array of tick positions
  const tickPositions = Array.from({ length: tickCount }, (_, i) => i * (100 / (tickCount - 1)));

  const containerStyle = {
    position: 'relative',
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor,
    borderRadius: '4px',
    overflow: 'hidden'
  };

  const fillStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: `${fillPercentage}%`,
    // Gradient from light red to dark red
    background: 'linear-gradient(to right, #770000, #dd0000)',
    transition: 'width 0.3s ease'
  };

  return (
    <div style={{ display: 'inline-block' }}>
      <div style={containerStyle}>
        <div style={fillStyle}></div>
        {tickPositions.map((pos, index) => {
          // Skip first and last ticks
          if (index === 0 || index === tickCount - 1) return null;
          const tickStyle = {
            position: 'absolute',
            left: `${pos}%`,
            bottom: 0,
            width: `${tickWidth}px`,
            height: `${tickHeight}px`,
            backgroundColor: tickColor,
            transform: 'translateX(-50%)'
          };
          return <div key={index} style={tickStyle}></div>;
        })}
      </div>
      <div style={{ textAlign: 'center', marginTop: '5px', fontSize: '14px', color: '#333' }}>
        {currentSpeed} / {maxSpeed}
      </div>
    </div>
  );
};

export default LinearSpeedometer;