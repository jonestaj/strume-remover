# main.py
import os
import uuid
import shutil
import subprocess
import json
import requests
import asyncio
from datetime import datetime
from fastapi import FastAPI, File, UploadFile, Form, Query, Request, HTTPException, Body
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.background import BackgroundTask
from sse_starlette.sse import EventSourceResponse

from app.utils import separate_vocals
from app.state import progress_state
from app.db import get_files_for_email, load_metadata, save_metadata, add_file_record, delete_file_record
import musicbrainzngs

musicbrainzngs.set_useragent("StrumeApp", "1.0", "https://strume.app")
ACOUSTID_API_KEY = "0Mu3wyP92J"

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/progress/{task_id}")
async def progress_stream(task_id: str):
    async def event_generator():
        while True:
            percent = progress_state.get(task_id, 0)
            yield f"data: {percent}\n\n"
            if percent >= 100 or percent == -1:
                break
            await asyncio.sleep(0.5)
    return EventSourceResponse(event_generator())

def cleanup_files(paths):
    for p in paths:
        if os.path.exists(p):
            os.remove(p)

@app.delete("/delete")
def delete_file(file: str = Body(...), email: str = Body(...)):
    file_path = os.path.join("stored", file)
    if os.path.exists(file_path):
        os.remove(file_path)
        delete_file_record(email, file)
        return {"message": "File deleted"}
    raise HTTPException(status_code=404, detail="File not found.")

@app.post("/detect-metadata")
async def detect_metadata(file: UploadFile = File(...)):
    temp_path = f"temp_{uuid.uuid4()}.mp3"
    try:
        with open(temp_path, "wb") as f:
            f.write(await file.read())

        print("🧪 Detecting metadata...")
        result = subprocess.run(
            ["fpcalc", "-json", temp_path],
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail="Fingerprinting failed.")

        output = json.loads(result.stdout)
        duration = int(output["duration"])
        fingerprint = output["fingerprint"]

        acoustid_res = requests.post(
            "https://api.acoustid.org/v2/lookup",
            data={
                "client": ACOUSTID_API_KEY,
                "meta": "recordings",
                "duration": duration,
                "fingerprint": fingerprint
            }
        )

        if acoustid_res.status_code != 200:
            raise HTTPException(status_code=500, detail="AcoustID API error.")

        data = acoustid_res.json()
        results = data.get("results", [])
        if not results or not results[0].get("recordings"):
            return {"title": "Unknown", "artist": "Unknown", "genre": "Unknown"}

        recording = results[0]["recordings"][0]
        title = recording.get("title", "Unknown")
        artist = recording.get("artists", [{}])[0].get("name", "Unknown")

        return {
            "title": title,
            "artist": artist,
            "genre": "Unknown"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.get("/download")
def download_file(file: str):
    file_path = os.path.join("stored", file)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found.")
    return FileResponse(
        file_path,
        media_type="audio/wav",
        filename=file
    )

@app.get("/files")
def list_files(email: str, request: Request):
    print(f"📨 Fetching files for: {email}")
    files = get_files_for_email(email)
    if not files:
        return {"email": email, "files": []}

    base_url = str(request.base_url)
    for f in files:
        f["download_url"] = f"{base_url}download?file={f['filename']}"
    return {"email": email, "files": files}

@app.post("/separate")
async def upload_audio(
    file: UploadFile = File(...),
    task_id: str = Query(None),
    keep_file: bool = Form(False),
    email: str = Form(None),
    title: str = Form(None),
    artist: str = Form(None),
    genre: str = Form(None)
):
    output_dir = "outputs"
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs("stored", exist_ok=True)

    file_ext = os.path.splitext(file.filename)[-1]
    input_filename = f"{uuid.uuid4()}{file_ext}"
    input_path = os.path.join(output_dir, input_filename)

    task_id = task_id or str(uuid.uuid4())

    with open(input_path, "wb") as f:
        f.write(await file.read())

    try:
        print(f"🔧 Separating vocals: {input_path}")
        instrumental_path = separate_vocals(input_path, output_dir, task_id)
        if not os.path.exists(instrumental_path):
            raise Exception("Instrumental file not created")
    except Exception as e:
        progress_state[task_id] = -1
        raise HTTPException(status_code=500, detail=f"Separation failed: {str(e)}")

    stored_path = None
    if keep_file:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        stored_filename = f"instrumental_{timestamp}.wav"
        stored_path = os.path.join("stored", stored_filename)
        shutil.copy(instrumental_path, stored_path)

        if email:
            metadata = {
                "filename": stored_filename,
                "title": title,
                "artist": artist,
                "genre": genre
            }
            add_file_record(email=email, file_metadata=metadata)

    def cleanup():
        if not keep_file:
            cleanup_files([input_path, instrumental_path])
        progress_state[task_id] = 100

    task = BackgroundTask(cleanup)
    return StreamingResponse(
        open(instrumental_path, "rb"),
        media_type="audio/wav",
        headers={"Content-Disposition": "attachment; filename=instrumental.wav"},
        background=task
    )
