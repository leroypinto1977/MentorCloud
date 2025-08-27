import React from 'react';

export default function SimpleTest() {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f9ff', 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ color: '#1e40af', marginBottom: '10px' }}>
          🤖 MentorCloud Chatbot
        </h1>
        <p style={{ color: '#64748b' }}>
          Hello! The component is working. Let me restore the full functionality...
        </p>
      </div>
    </div>
  );
}
