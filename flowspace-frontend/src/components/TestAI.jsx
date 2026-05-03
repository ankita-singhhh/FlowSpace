import React from 'react';

export default function TestAI() {
  console.log('TestAI component is rendering!');
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '80px',
      height: '80px',
      backgroundColor: 'blue',
      borderRadius: '50%',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '12px'
    }}>
      TEST AI
    </div>
  );
}
