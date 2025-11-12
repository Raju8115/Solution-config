import React from 'react';
import { useAuth } from '../contexts/AuthContexts';


const Login = () => {
  const { login } = useAuth();

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh' 
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1>Solution Offering</h1>
        <p>Please sign in to continue</p>
        <button 
          onClick={login}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#0f62fe',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sign in with IBM W3
        </button>
      </div>
    </div>
  );
};

export default Login;