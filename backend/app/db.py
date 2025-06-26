import os
import json

METADATA_FILE = "stored/metadata.json"
os.makedirs("stored", exist_ok=True)

def load_metadata():
    if not os.path.exists(METADATA_FILE):
        return {}
    with open(METADATA_FILE, "r") as f:
        return json.load(f)

def save_metadata(metadata):
    with open(METADATA_FILE, "w") as f:
        json.dump(metadata, f, indent=2)

def add_file_record(email, file_metadata):
    metadata = load_metadata()
    metadata.setdefault(email, []).append(file_metadata)
    save_metadata(metadata)

def get_files_for_email(email):
    metadata = load_metadata()
    return metadata.get(email, [])

DB_PATH = "stored/metadata.json"

def load_metadata():
    if not os.path.exists(DB_PATH):
        return {}
    with open(DB_PATH, "r") as f:
        return json.load(f)

def save_all_metadata(data):
    with open(DB_PATH, "w") as f:
        json.dump(data, f, indent=2)

def delete_file_record(email, filename):
    data = load_metadata()
    if email in data:
        data[email] = [f for f in data[email] if f["filename"] != filename]
        save_all_metadata(data)