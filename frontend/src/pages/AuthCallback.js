import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AuthCallback = () => {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSession = async () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1));
      const sessionId = params.get('session_id');

      if (!sessionId) {
        toast.error('No session ID found');
        navigate('/login');
        return;
      }

      try {
        await axios.post(
          `${BACKEND_URL}/api/auth/session`,
          { session_id: sessionId },
          { withCredentials: true }
        );

        const userResponse = await axios.get(`${BACKEND_URL}/api/auth/me`, {
          withCredentials: true
        });

        toast.success('Successfully logged in!');
        navigate('/dashboard', { replace: true, state: { user: userResponse.data } });
      } catch (error) {
        toast.error('Authentication failed');
        navigate('/login');
      }
    };

    processSession();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-muted-foreground">Processing authentication...</div>
    </div>
  );
};

export default AuthCallback;
