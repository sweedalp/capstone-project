import os
import uuid
import json
import time
import certifi
import ssl
import base64
import logging
import threading
import numpy as np
import sounddevice as sd
import queue
import signal
import sys
import requests

from collections import deque
from dotenv import load_dotenv
from azure.identity import DefaultAzureCredential
import websocket
from datetime import datetime

AUDIO_SAMPLE_RATE = 24000
AUDIO_CHANNELS = 1

stop_event = threading.Event()

logger = logging.getLogger(__name__)


def fetch_context_instructions() -> str:
    default_instructions = (
        "You are a helpful AI assistant. "
        "Respond quickly and naturally. "
        "IMPORTANT: detect the user's language and respond in the SAME language. "
        "If the user asks outside the uploaded lesson content, clearly say you can only answer from the loaded lesson content."
    )

    context_api_url = os.getenv("CONTEXT_API_URL", "").rstrip("/")
    if not context_api_url:
        return default_instructions

    try:
        res = requests.get(f"{context_api_url}/instructions", timeout=10)
        res.raise_for_status()
        data = res.json()
        instructions = data.get("instructions", default_instructions)
        print(f"📚 Loaded context: {data.get('context_summary', 'N/A')}")
        return instructions[:20000]
    except Exception as e:
        print(f"⚠️ Could not fetch context from {context_api_url}: {e}")
        return default_instructions


class VoiceLiveConnection:
    def __init__(self, url: str, headers: dict) -> None:
        self._url = url
        self._headers = headers
        self._ws = None
        self._message_queue = queue.Queue()
        self._connected = False

    def connect(self) -> None:
        def on_message(ws, message):
            self._message_queue.put(message)

        def on_error(ws, error):
            logger.error(f"WebSocket error: {error}")
            print(f"WebSocket error: {error}")

        def on_close(ws, close_status_code, close_msg):
            logger.info("WebSocket connection closed")
            print(f"WebSocket closed - Status: {close_status_code}, Message: {close_msg}")
            self._connected = False

        def on_open(ws):
            logger.info("WebSocket connection opened")
            print("✅ WebSocket connected")
            self._connected = True

        self._ws = websocket.WebSocketApp(
            self._url,
            header=self._headers,
            on_message=on_message,
            on_error=on_error,
            on_close=on_close,
            on_open=on_open,
        )

        def run_ws():
            self._ws.run_forever(
                sslopt={
                    "cert_reqs": ssl.CERT_REQUIRED,
                    "ca_certs": certifi.where(),
                }
            )

        self._ws_thread = threading.Thread(target=run_ws, daemon=True)
        self._ws_thread.start()

        timeout = 8
        start = time.time()
        while not self._connected and time.time() - start < timeout:
            time.sleep(0.05)

        if not self._connected:
            raise ConnectionError(f"Failed to connect to {self._url}")

    def recv(self):
        try:
            return self._message_queue.get(timeout=0.5)
        except queue.Empty:
            return None

    def send(self, message: str):
        if self._ws and self._connected:
            self._ws.send(message)

    def close(self):
        if self._ws:
            self._ws.close()
            self._connected = False


class AzureVoiceLive:
    def __init__(self, azure_endpoint=None, api_version=None, token=None, api_key=None):
        self._azure_endpoint = azure_endpoint
        self._api_version = api_version
        self._token = token
        self._api_key = api_key
        self._connection = None

    def connect(self, model: str) -> VoiceLiveConnection:
        if self._connection is not None:
            raise ValueError("Already connected")
        if not model:
            raise ValueError("Model name is required")

        azure_ws_endpoint = self._azure_endpoint.rstrip('/').replace("https://", "wss://")
        url = f"{azure_ws_endpoint}/voice-live/realtime?api-version={self._api_version}&model={model}"

        auth_header = {"Authorization": f"Bearer {self._token}"} if self._token else {"api-key": self._api_key}
        headers = {"x-ms-client-request-id": str(uuid.uuid4()), **auth_header}

        self._connection = VoiceLiveConnection(url, headers)
        self._connection.connect()
        return self._connection


class AudioPlayerAsync:
    def __init__(self):
        self.queue = deque()
        self.lock = threading.Lock()
        self.stream = sd.OutputStream(
            callback=self.callback,
            samplerate=AUDIO_SAMPLE_RATE,
            channels=1,
            dtype=np.int16,
            blocksize=1200,
        )
        self.playing = False

    def is_active(self):
        with self.lock:
            return len(self.queue) > 0 or self.playing

    def callback(self, outdata, frames, time_info, status):
        if status:
            logger.warning(f"Stream status: {status}")

        with self.lock:
            data = np.zeros(frames, dtype=np.int16)
            data_filled = 0

            while data_filled < frames and len(self.queue) > 0:
                item = self.queue.popleft()
                frames_needed = min(frames - data_filled, len(item))
                data[data_filled:data_filled + frames_needed] = item[:frames_needed]
                data_filled += frames_needed

                if len(item) > frames_needed:
                    self.queue.appendleft(item[frames_needed:])
                    break

            if len(self.queue) == 0 and data_filled < frames:
                self.playing = False

        outdata[:] = data.reshape(-1, 1)

    def add_data(self, data: bytes):
        with self.lock:
            np_data = np.frombuffer(data, dtype=np.int16)
            self.queue.append(np_data)
            if not self.playing and len(self.queue) > 0:
                self.start()

    def start(self):
        if not self.playing:
            self.playing = True
            self.stream.start()

    def stop(self):
        with self.lock:
            self.queue.clear()
        self.playing = False
        self.stream.stop()

    def terminate(self):
        with self.lock:
            self.queue.clear()
        self.stream.stop()
        self.stream.close()


def listen_and_send_audio(connection: VoiceLiveConnection, audio_player: AudioPlayerAsync):
    stream = sd.InputStream(
        channels=1,
        samplerate=AUDIO_SAMPLE_RATE,
        dtype="int16",
        blocksize=1200,
    )

    try:
        stream.start()
        read_size = int(AUDIO_SAMPLE_RATE * 0.01)

        while not stop_event.is_set():
            if stream.read_available >= read_size:
                data, _ = stream.read(read_size)

                if audio_player.is_active():
                    time.sleep(0.01)
                    continue

                audio = base64.b64encode(data).decode("utf-8")
                payload = {
                    "type": "input_audio_buffer.append",
                    "audio": audio,
                    "event_id": "",
                }
                connection.send(json.dumps(payload))
            else:
                time.sleep(0.0005)
    finally:
        stream.stop()
        stream.close()


def receive_audio_and_playback(connection: VoiceLiveConnection, audio_player: AudioPlayerAsync):
    response_transcripts = {}
    last_response_id = None
    completed_responses = set()

    print("\n=== Azure Voice Live Chat Started ===")
    print("Speak into your microphone...\n")

    try:
        while not stop_event.is_set():
            raw_event = connection.recv()
            if raw_event is None:
                continue

            try:
                event = json.loads(raw_event)
                event_type = event.get("type")

                if event_type == "session.created":
                    print("✅ Session created successfully")

                elif event_type == "input_audio_buffer.speech_started":
                    audio_player.stop()

                elif event_type == "conversation.item.input_audio_transcription.completed":
                    transcript = event.get("transcript", "")
                    if transcript:
                        print(f"\n👤 You: {transcript}")

                elif event_type == "response.created":
                    response_id = event.get("response", {}).get("id")
                    last_response_id = response_id
                    if response_id:
                        response_transcripts[response_id] = ""
                    print("🤖 AI: ", end="", flush=True)

                elif event_type == "response.audio_transcript.delta":
                    delta = event.get("delta", "")
                    response_id = event.get("response_id") or event.get("item_id")

                    if delta and response_id:
                        if response_id not in response_transcripts:
                            response_transcripts[response_id] = ""
                        response_transcripts[response_id] += delta

                elif event_type == "response.audio_transcript.done":
                    response_id = event.get("response_id") or event.get("item_id")
                    if response_id and response_id not in completed_responses:
                        completed_responses.add(response_id)
                        final_transcript = response_transcripts.get(response_id, "")
                        if final_transcript:
                            print(f"\r🤖 AI: {final_transcript}\n")

                elif event_type == "response.audio.delta":
                    bytes_data = base64.b64decode(event.get("delta", ""))
                    if bytes_data:
                        audio_player.add_data(bytes_data)

                elif event_type == "error":
                    error_details = event.get("error", {})
                    print(f"❌ Error: {error_details.get('message', 'Unknown error')}")

            except Exception as e:
                logger.error(f"Playback parse error: {e}")
    finally:
        audio_player.stop()
        print("\n=== Chat ended ===")


def read_keyboard_and_quit():
    print("💡 Press 'q' and Enter to quit.")
    while not stop_event.is_set():
        try:
            user_input = input()
            if user_input.strip().lower() == "q":
                print("👋 Quitting...")
                stop_event.set()
                break
        except EOFError:
            break


def main():
    endpoint = os.getenv("AZURE_VOICE_LIVE_ENDPOINT")
    model = os.getenv("AZURE_VOICE_LIVE_MODEL", "gpt-4o")
    api_version = "2025-05-01-preview"
    api_key = os.getenv("AZURE_VOICE_LIVE_API_KEY")

    if not endpoint:
        print("Error: AZURE_VOICE_LIVE_ENDPOINT is not set")
        return

    instructions = fetch_context_instructions()

    token_val = None
    if not api_key:
        try:
            credential = DefaultAzureCredential()
            token_obj = credential.get_token("https://ai.azure.com/.default")
            token_val = token_obj.token
            print("✅ Azure token acquired")
        except Exception as e:
            print(f"Error obtaining Azure token: {e}")
            return
    else:
        print("✅ Using API key authentication")

    try:
        client = AzureVoiceLive(
            azure_endpoint=endpoint,
            api_version=api_version,
            token=token_val,
            api_key=api_key,
        )

        print(f"🔗 Connecting with model: {model}")
        connection = client.connect(model=model)
        print("✅ Connected to Azure Voice Live API")

        session_update = {
            "type": "session.update",
            "session": {
                "instructions": instructions,
                "turn_detection": {
                    "type": "azure_semantic_vad",
                    "threshold": 0.5,
                    "prefix_padding_ms": 300,
                    "silence_duration_ms": 500,
                    "remove_filler_words": True,
                    "end_of_utterance_detection": {
                        "model": "semantic_detection_v1",
                        "threshold": 0.005,
                        "timeout": 2,
                    },
                },
                "input_audio_noise_reduction": {
                    "type": "azure_deep_noise_suppression"
                },
                "input_audio_echo_cancellation": {
                    "type": "server_echo_cancellation"
                },
                "voice": {
                    "name": "en-US-Ava:DragonHDLatestNeural",
                    "type": "azure-standard",
                    "temperature": 0.6,
                    "rate": "1",
                },
            },
            "event_id": "",
        }

        connection.send(json.dumps(session_update))
        print("📝 Session configuration sent")

        audio_player = AudioPlayerAsync()

        send_thread = threading.Thread(target=listen_and_send_audio, args=(connection, audio_player))
        receive_thread = threading.Thread(target=receive_audio_and_playback, args=(connection, audio_player))
        keyboard_thread = threading.Thread(target=read_keyboard_and_quit)

        send_thread.start()
        receive_thread.start()
        keyboard_thread.start()

        keyboard_thread.join()
        stop_event.set()

        send_thread.join(timeout=2)
        receive_thread.join(timeout=2)

        audio_player.terminate()
        connection.close()
        print("✅ Chat done")

    except Exception as e:
        print(f"Error connecting to Azure Voice Live API: {e}")


if __name__ == "__main__":
    try:
        os.chdir(os.path.dirname(os.path.abspath(__file__)))

        if not os.path.exists("logs"):
            os.makedirs("logs")

        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        logging.basicConfig(
            filename=f"logs/{timestamp}_voicelive.log",
            filemode="w",
            level=logging.DEBUG,
            format="%(asctime)s:%(name)s:%(levelname)s:%(message)s",
        )

        load_dotenv("./.env", override=True)

        def signal_handler(signum, frame):
            print("\nReceived interrupt signal, shutting down...")
            stop_event.set()
            sys.exit(0)

        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)

        main()
    except Exception as e:
        print(f"Error: {e}")
        stop_event.set()