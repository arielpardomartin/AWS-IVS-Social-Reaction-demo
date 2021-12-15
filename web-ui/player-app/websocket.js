const setOnMessageListener = (socket, isDebugMode, onMessage) => {
  const listenerDebugOn = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('[Websockets message] Data received from server:', data);
      onMessage(data);
    } catch (err) {
      console.log(err);
    }
  };

  const listenerDebugOff = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (err) {
      console.log(err);
    }
  };

  socket.onmessage = isDebugMode ? listenerDebugOn : listenerDebugOff;
};

const createSocket = (url, isDebugMode, onMessage) => {
  let socket;

  try {
    /* eslint-disable no-undef */
    socket = new WebSocket(url);

    socket.onopen = () => {
      console.info(`[Websocket onopen event] Connected to URL: ${url}`);
    };

    setOnMessageListener(socket, isDebugMode, onMessage);

    socket.onerror = (error) => {
      console.error('[Websocket onerror event]', error);
    };
  } catch (err) {
    console.error(`[Websockets exception] ${err.message}`);
  }

  return socket;
};

export { createSocket, setOnMessageListener };
