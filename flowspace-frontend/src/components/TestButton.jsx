import React from 'react';

export default function TestButton() {
  console.log('TestButton component is rendering!');
  
  return (
    <button
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '100px',
        height: '40px',
        backgroundColor: 'red',
        color: 'white',
        border: 'none',
        borderRadius: '20px',
        zIndex: 9999,
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold'
      }}
      onClick={() => alert('Test button works!')}
    >
      TEST AI
    </button>
  );
}
