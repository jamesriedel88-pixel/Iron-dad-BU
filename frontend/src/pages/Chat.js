import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [ws, setWs] = useState(null);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true });
        setUser(response.data);
      } catch (error) {
        toast.error('Failed to fetch user data');
      }
    };

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/chat/messages`, { withCredentials: true });
        setMessages(response.data);
      } catch (error) {
        toast.error('Failed to fetch messages');
      }
    };

    fetchUser();
    fetchMessages();
  }, []);

  useEffect(() => {
    if (!user) return;

    const connectWebSocket = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true });
        if (!response.data) {
          toast.error('Authentication required');
          return;
        }
      } catch (error) {
        toast.error('Failed to authenticate for chat');
        return;
      }

      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
      };

      const token = getCookie('session_token');
      
      const wsUrl = BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://');
      const socket = new WebSocket(`${wsUrl}/ws/chat${token ? `?token=${token}` : ''}`);

      socket.onopen = () => {
        console.log('WebSocket connected');
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setMessages((prev) => [...prev, message]);
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      socket.onclose = () => {
        console.log('WebSocket disconnected');
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Reconnecting...');
          connectWebSocket();
        }, 3000);
      };

      setWs(socket);
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [user]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(JSON.stringify({ message: newMessage }));
    setNewMessage('');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="glass-header p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight uppercase">Community Chat</h1>
              <p className="text-sm text-muted-foreground">Connect with the brotherhood</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwnMessage = msg.user_id === user?.user_id;
              return (
                <div
                  key={msg.message_id}
                  data-testid={`chat-message-${msg.message_id}`}
                  className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={msg.user_picture} />
                    <AvatarFallback className="bg-primary text-white">
                      {msg.user_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{msg.user_name}</span>
                      <span className="text-xs text-muted-foreground">{formatTime(msg.timestamp)}</span>
                    </div>
                    <Card
                      className={`p-3 ${
                        isOwnMessage
                          ? 'bg-primary text-white border-primary'
                          : 'bg-zinc-900 border-zinc-800'
                      }`}
                    >
                      <p className="text-sm break-words">{msg.message}</p>
                    </Card>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t border-border p-4 bg-card">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-2">
          <Input
            data-testid="chat-message-input"
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-zinc-900/50 border-zinc-800 focus:border-primary focus:ring-1 focus:ring-primary rounded-sm h-12"
          />
          <Button
            type="submit"
            data-testid="send-message-button"
            disabled={!newMessage.trim() || !ws || ws.readyState !== WebSocket.OPEN}
            className="bg-primary text-white hover:bg-primary/90 rounded-sm font-bold uppercase tracking-wider px-6"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
