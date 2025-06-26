# utils.py
import os
import torchaudio
from demucs.pretrained import get_model
from demucs.apply import apply_model
from demucs.audio import AudioFile
import torch
from app.state import progress_state

# Load Demucs model once
model = get_model(name='htdemucs')
device = 'cuda' if torch.cuda.is_available() else 'cpu'
model.to(device)
print(f"🚀 Demucs model loaded on: {device}")

def separate_vocals(input_path: str, output_dir: str, task_id: str = None) -> str:
    try:
        print(f"📂 Reading audio file: {input_path}")
        if task_id:
            progress_state[task_id] = 10

        wav = AudioFile(input_path).read(
            streams=0,
            samplerate=model.samplerate,
            channels=model.audio_channels
        )
        print("✅ Audio file loaded")
        if task_id:
            progress_state[task_id] = 30

        print("🎛 Applying Demucs model...")
        sources = apply_model(
            model,
            wav[None].to(device),
            split=True,
            overlap=0.25,
            progress=True  # This only shows a console progress bar, doesn't call back
        )[0]
        if task_id:
            progress_state[task_id] = 70

        if sources.shape[0] < 4:
            raise RuntimeError("Expected 4 stems (drums, bass, other, vocals), got fewer.")

        instrumental = sources[0] + sources[1] + sources[2]
        instrumental /= instrumental.abs().max() + 1e-8
        instrumental = instrumental.cpu()

        stem_name = os.path.splitext(os.path.basename(input_path))[0]
        output_path = os.path.join(output_dir, f"{stem_name}_instrumental.wav")
        torchaudio.save(output_path, instrumental, model.samplerate, backend="sox")

        if not os.path.exists(output_path):
            raise RuntimeError("Instrumental file not saved.")

        print("✅ Separation complete.")
        if task_id:
            progress_state[task_id] = 95

        return output_path

    except Exception as e:
        print(f"❌ Error during separation: {e}")
        if task_id:
            progress_state[task_id] = -1
        raise
