import io from 'socket.io-client';

let socket = null;

export const initializeSocket = (userId) => {
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  socket = io(SOCKET_URL, {
    auth: {
      token: localStorage.getItem('studentToken') || localStorage.getItem('teacherToken'),
    },
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    socket.emit('user_connected', userId);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('quiz_assigned', (data) => {
    console.log('New quiz assigned:', data);
    // Dispatch custom event that can be listened to by React components
    window.dispatchEvent(
      new CustomEvent('quizAssigned', { detail: data })
    );
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const emitEvent = (event, data) => {
  if (socket) {
    socket.emit(event, data);
  }
};

export const onEvent = (event, callback) => {
  if (socket) {
    socket.on(event, callback);
  }
};

export const offEvent = (event, callback) => {
  if (socket) {
    socket.off(event, callback);
  }
};
