import os
import sys
import subprocess
from pathlib import Path

def main():
    root = Path(__file__).resolve().parent
    backend_dir = root / "backend"
    frontend_dir = root / "frontend"
    frontend_dist = frontend_dir / "dist"

    # If dist doesn't exist, build it
    if not frontend_dist.exists() or not (frontend_dist / "index.html").exists():
        print("Building frontend assets...")
        subprocess.run(["npm", "run", "build"], cwd=str(frontend_dir), shell=True, check=True)

    print("\n" + "="*50)
    print("  BuildLog — My AI Engineering Journey")
    print("  Server running at: http://127.0.0.1:8000")
    print("  SQLite Database:   backend/buildlog.db")
    print("="*50 + "\n")

    sys.path.insert(0, str(backend_dir))
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False, app_dir=str(backend_dir))

if __name__ == "__main__":
    main() 
