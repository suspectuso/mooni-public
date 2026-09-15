"""Parakeet v3 ASR-сервер (NVIDIA NeMo) для Mooni.

POST /transcribe (multipart file: аудио любого формата, что читает libsndfile — ogg/opus/wav)
→ {"text": "..."}. Декодируем soundfile → ресемпл 16k mono → NeMo transcribe.
Слушает 127.0.0.1:9001; наружу — через SSH-туннель на play2go.
"""

import io
import os
import tempfile

import soundfile as sf
import librosa
from fastapi import FastAPI, File, UploadFile
import nemo.collections.asr as nemo_asr

MODEL = os.environ.get("PARAKEET_MODEL", "nvidia/parakeet-tdt-0.6b-v3")


def _load(name):
    # ASRModel абстрактный — для parakeet-tdt нужен конкретный RNNT-класс.
    try:
        return nemo_asr.models.ASRModel.from_pretrained(model_name=name)
    except TypeError:
        return nemo_asr.models.EncDecRNNTBPEModel.from_pretrained(model_name=name)


app = FastAPI()
model = _load(MODEL)


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL}


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    raw = await file.read()
    data, sr = sf.read(io.BytesIO(raw), dtype="float32")
    if getattr(data, "ndim", 1) > 1:
        data = data.mean(axis=1)
    if sr != 16000:
        data = librosa.resample(data, orig_sr=sr, target_sr=16000)

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        sf.write(tmp.name, data, 16000)
        path = tmp.name
    try:
        out = model.transcribe([path])
        hyp = out[0]
        text = getattr(hyp, "text", None)
        if text is None:
            text = hyp if isinstance(hyp, str) else str(hyp)
    finally:
        os.unlink(path)
    return {"text": text}
