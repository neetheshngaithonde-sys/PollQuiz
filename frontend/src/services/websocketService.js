function getWsBaseUrl() {
  const envUrl = import.meta.env.VITE_WS_URL;
  if (envUrl) {
    if (window.location.protocol === 'https:' && envUrl.startsWith('ws://')) {
      return envUrl.replace('ws://', 'wss://');
    }
    return envUrl;
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.hostname}:8080/ws`;
}

export function connectPollWebSocket(pollId, onUpdate, onConnectionChange) {
  const url = `${getWsBaseUrl()}/polls/${pollId}`;
  let socket = null;
  let isClosedManually = false;
  let retryCount = 0;
  let reconnectTimer = null;

  function connect() {
    if (isClosedManually) return;

    try {
      socket = new WebSocket(url);

      socket.onopen = () => {
        retryCount = 0;
        if (onConnectionChange) onConnectionChange(true);
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (onUpdate) {
            // payload format: { type: "VOTE_UPDATE" | "INITIAL_STATE", results: {...} }
            onUpdate(payload);
          }
        } catch (err) {
          console.error('[WebSocket] Message parse error:', err);
        }
      };

      socket.onclose = () => {
        if (onConnectionChange) onConnectionChange(false);
        if (!isClosedManually) {
          // Reconnect with exponential backoff capped at 5s
          const timeout = Math.min(1000 * Math.pow(1.5, retryCount), 5000);
          retryCount++;
          reconnectTimer = setTimeout(connect, timeout);
        }
      };

      socket.onerror = (err) => {
        console.warn('[WebSocket] Connection error:', err);
        socket?.close();
      };
    } catch (e) {
      console.error('[WebSocket] Failed to establish connection:', e);
    }
  }

  connect();

  return {
    disconnect() {
      isClosedManually = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (socket) socket.close();
    },
  };
}
