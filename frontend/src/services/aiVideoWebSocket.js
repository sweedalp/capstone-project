/**
 * aiVideoWebSocket.js
 * WebSocket service for the AI Video Chat Agent.
 * Connects to FastAPI WebSocket at /ws/chat on port 8002.
 *
 * Architecture:
 *   React (5173) → WebSocket → AI Video Chat Agent (8002)
 *   Messages: JSON { action, text, language, difficulty }
 *   Responses: JSON { type: text|scene|status|complete|error }
 */

// ── Configuration ─────────────────────────────────────────────
const AI_VIDEO_WS_URL =
  import.meta.env.VITE_AI_VIDEO_WS_URL || 'ws://localhost:8002/ws/chat';

const AI_VIDEO_API_URL =
  import.meta.env.VITE_AI_VIDEO_API_URL || 'http://localhost:8002';

// ── Base64 → Blob URL converter ───────────────────────────────
export function base64ToBlobUrl(base64String, mimeType = 'video/mp4') {
  try {
    const raw = atob(base64String);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      bytes[i] = raw.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('base64ToBlobUrl failed:', err);
    return null;
  }
}

// ── Download blob URL as file ─────────────────────────────────
export function downloadBlobUrl(blobUrl, filename = 'scene.mp4') {
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ── Download compiled video from REST endpoint ────────────────
export async function downloadCompiledVideo(
  downloadPath,
  filename = 'explainer.mp4'
) {
  try {
    const url = `${AI_VIDEO_API_URL}${downloadPath}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Download failed: ${res.status}`);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    downloadBlobUrl(blobUrl, filename);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch (err) {
    console.error('Compiled video download failed:', err);
    window.open(`${AI_VIDEO_API_URL}${downloadPath}`, '_blank');
  }
}

// ── Health check ──────────────────────────────────────────────
export async function checkVideoAgentHealth() {
  try {
    const res = await fetch(`${AI_VIDEO_API_URL}/api/health`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { status: 'error', code: res.status };
    return await res.json();
  } catch (err) {
    return { status: 'unreachable', error: err.message };
  }
}

// ══════════════════════════════════════════════════════════════
// WebSocket Manager Class
// ══════════════════════════════════════════════════════════════
export class AIVideoSocket {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.sessionId = null;
    this.pingInterval = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.callbacks = {
      onOpen: null,
      onClose: null,
      onError: null,
      onConnected: null,    // Fired when server sends session_id
      onText: null,         // Agent text response
      onScene: null,        // Scene video ready
      onStatus: null,       // Processing status update
      onComplete: null,     // Generation complete
      onCleared: null,      // Chat cleared
      onDifficultyChanged: null,
      onProgress: null,     // Learning progress data
      onHeartbeat: null,
      onRawMessage: null,   // Every raw message (for debugging)
    };
  }

  /**
   * Open the WebSocket connection.
   * @param {Object} callbacks — event handlers
   * @returns {Promise<void>} resolves when connected
   */
  connect(callbacks = {}) {
    return new Promise((resolve, reject) => {
      // Already connected
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }
      // Close any existing dead connection
      if (this.ws) {
        try { this.ws.close(); } catch (_) { /* ignore */ }
      }
      Object.assign(this.callbacks, callbacks);
      console.log('[AIVideoSocket] Connecting to:', AI_VIDEO_WS_URL);
      this.ws = new WebSocket(AI_VIDEO_WS_URL);

      // Connection timeout
      const timeout = setTimeout(() => {
        if (!this.isConnected) {
          console.error('[AIVideoSocket] Connection timeout');
          this.ws?.close();
          reject(new Error('Connection timeout — is the AI Video Agent running on port 8002?'));
        }
      }, 10000);

      this.ws.onopen = () => {
        console.log('[AIVideoSocket] WebSocket opened');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        clearTimeout(timeout);
        // Start keepalive ping every 25s
        this.pingInterval = setInterval(() => {
          this.send({ action: 'ping' });
        }, 25000);
        this.callbacks.onOpen?.();
        // Don't resolve yet — wait for 'connected' message with session_id
      };

      this.ws.onclose = (event) => {
        console.log('[AIVideoSocket] WebSocket closed:', event.code, event.reason);
        this.isConnected = false;
        this.sessionId = null;
        clearInterval(this.pingInterval);
        clearTimeout(timeout);
        this.callbacks.onClose?.(event);
      };

      this.ws.onerror = (err) => {
        console.error('[AIVideoSocket] WebSocket error:', err);
        this.isConnected = false;
        clearTimeout(timeout);
        this.callbacks.onError?.(err);
        reject(new Error('WebSocket connection failed'));
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.callbacks.onRawMessage?.(data);
          // Handle the initial 'connected' message
          if (data.type === 'connected') {
            this.sessionId = data.session_id;
            console.log('[AIVideoSocket] Session ID:', this.sessionId);
            this.callbacks.onConnected?.(data);
            resolve(); // NOW resolve the connect promise
            return;
          }
          this._dispatch(data);
        } catch (e) {
          console.error('[AIVideoSocket] Message parse error:', e, event.data);
        }
      };
    });
  }

  /** Route incoming messages to callbacks */
  _dispatch(data) {
    switch (data.type) {
      case 'text':
        this.callbacks.onText?.(data.content);
        break;
      case 'scene':
        this.callbacks.onScene?.(data);
        break;
      case 'status':
        this.callbacks.onStatus?.(data);
        break;
      case 'complete':
        this.callbacks.onComplete?.(data);
        break;
      case 'error':
        this.callbacks.onError?.(data);
        break;
      case 'cleared':
        this.callbacks.onCleared?.(data);
        break;
      case 'difficulty_changed':
        this.callbacks.onDifficultyChanged?.(data);
        break;
      case 'progress':
        this.callbacks.onProgress?.(data.data);
        break;
      case 'heartbeat':
      case 'pong':
        this.callbacks.onHeartbeat?.();
        break;
      default:
        console.warn('[AIVideoSocket] Unknown message type:', data.type);
    }
  }

  /** Send a JSON message over WebSocket */
  send(payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
      return true;
    }
    console.warn('[AIVideoSocket] Cannot send — not connected');
    return false;
  }

  /** Send a chat message to generate video */
  sendMessage(text, language = 'en', difficulty = null) {
    return this.send({
      action: 'message',
      text,
      language,
      difficulty,
    });
  }

  /** Send an interactive element click */
  sendInteractiveClick(sceneNumber, elementId, language = 'en') {
    return this.send({
      action: 'interactive_click',
      scene_number: sceneNumber,
      element_id: elementId,
      language,
    });
  }

  /** Change difficulty level */
  setDifficulty(level) {
    return this.send({
      action: 'set_difficulty',
      level,
    });
  }

  /** Clear chat history */
  clearChat() {
    return this.send({ action: 'clear' });
  }

  /** Request learning progress */
  getProgress() {
    return this.send({ action: 'get_progress' });
  }

  /** Disconnect and clean up */
  disconnect() {
    console.log('[AIVideoSocket] Disconnecting...');
    clearInterval(this.pingInterval);
    this.pingInterval = null;
    if (this.ws) {
      try {
        this.ws.close(1000, 'Client disconnect');
      } catch (_) { /* ignore */ }
      this.ws = null;
    }
    this.isConnected = false;
    this.sessionId = null;
  }

  /** Check if currently connected */
  get connected() {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }
}

export default AIVideoSocket;