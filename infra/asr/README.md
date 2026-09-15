# ASR — голосовой ввод (Parakeet v3)

Голос в Telegram-боте → распознавание → маршрут под настроение.

## Где крутится
- **Сервер**: sus (<GPU_HOST>:<PORT>, GPU RTX 3060). venv `~/parakeet-venv`, модель
  `nvidia/parakeet-tdt-0.6b-v3` (NeMo, мультиязычная, рус). Сервер [`parakeet_server.py`](./parakeet_server.py)
  (FastAPI) слушает `127.0.0.1:9001`, `POST /transcribe` (multipart `file`) → `{text}`.
- **Туннель**: play2go `parakeet-tunnel.service` (SSH `-L 127.0.0.1:9001:127.0.0.1:9001 <user>@<GPU_HOST>`),
  как `ollama-tunnel`. Прод-API зовёт `ASR_URL=http://localhost:9001/transcribe`.
- **API**: `AsrService` шлёт сырое аудио (.oga/opus) → сервер декодирует (soundfile) сам.
  Бот (`bot.service`) на `message:voice` → транскрипт → `parseMood` → `ai.buildRoute` под настроение.

## Установка на sus (без sudo, venv)
```bash
python3 -m venv ~/parakeet-venv
~/parakeet-venv/bin/pip install "nemo_toolkit[asr]" fastapi uvicorn soundfile python-multipart librosa
scp -P <PORT> infra/asr/parakeet_server.py <user>@<GPU_HOST>:~/
# запуск (модель скачается с HF при первом старте):
~/parakeet-venv/bin/uvicorn parakeet_server:app --host 127.0.0.1 --port 9001
# фоном: nohup ... &  (или user-crontab @reboot)
```

## Туннель на play2go (root)
Скопировать `ollama-tunnel.service` → `parakeet-tunnel.service`, заменить порт на `9001`,
`systemctl enable --now parakeet-tunnel`. Затем в `/opt/mooni/.env`:
`ASR_URL="http://localhost:9001/transcribe"` + `systemctl restart mooni-api`.
