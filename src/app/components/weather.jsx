import React from 'react';

const weatherInformation = ({
  temperature = 25,
  
}) => {
  
  const currentTemp = Math.max(0, Math.min(temperature, maxTemp));
  const currentPrec = Math.max(0, Math.min(precipitation, maxPrec));

  const containerStyle = {
    position: 'relative',
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor,
    borderRadius: '3px',
    overflow: 'hidden',
    // Non-standard properties won't affect CSS, but they can be removed or kept for debugging.
    // temperature: `${temperature}px`,
    // precipitation: `${precipitation}px`
  };

  return (
    <div style={{ display: 'inline-block'}}>
      <div style={containerStyle}>
        {/* Display the temperature and precipitation directly */}
        <div style={{ position: 'absolute', color: '#fff', left: '10px', top: '10px' }}>
          <strong>Temperature:</strong> {currentTemp}°F
        </div>
        <div style={{ position: 'absolute', color: '#fff', left: '10px', top: '40px' }}>
          <strong>Precipitation:</strong> {currentPrec}%
        </div>
      </div>
    </div>
  );
};

export default weatherInformation;