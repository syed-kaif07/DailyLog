import os
from pathlib import Path
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from database import init_db
from models import (
    TechnologyCreate, TechnologyUpdate, TechnologyResponse,
    ProgressEntryCreate, ProgressEntryUpdate, ProgressEntryResponse,
    InsightsResponse, BatchReorderRequest
)
import crud
from seed_data import seed_demo_data, clear_demo_data

app = FastAPI(
    title="BuildLog API",
    description="Backend for BuildLog — My AI Engineering Journey",
    version="1.0.0"
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()

# ----------------- TECHNOLOGIES -----------------

@app.get("/api/technologies", response_model=List[TechnologyResponse])
def list_technologies():
    return crud.get_technologies()

@app.post("/api/technologies", response_model=TechnologyResponse, status_code=status.HTTP_201_CREATED)
def create_technology(payload: TechnologyCreate):
    try:
        return crud.create_technology(payload.name, payload.color)
    except Exception as e:
        if "UNIQUE" in str(e).upper():
            raise HTTPException(status_code=400, detail=f"Technology '{payload.name}' already exists.")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/technologies/{tech_id}", response_model=TechnologyResponse)
def update_technology(tech_id: int, payload: TechnologyUpdate):
    try:
        updated = crud.update_technology(tech_id, payload.name, payload.color)
        if not updated:
            raise HTTPException(status_code=404, detail="Technology not found.")
        return updated
    except Exception as e:
        if "UNIQUE" in str(e).upper():
            raise HTTPException(status_code=400, detail=f"Technology with name '{payload.name}' already exists.")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/technologies/{tech_id}")
def delete_technology(tech_id: int):
    try:
        success = crud.delete_technology(tech_id)
        if not success:
            raise HTTPException(status_code=404, detail="Technology not found.")
        return {"message": "Technology deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ----------------- ENTRIES -----------------

@app.get("/api/entries", response_model=List[ProgressEntryResponse])
def list_entries(
    technology_id: Optional[int] = None,
    status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    search: Optional[str] = None,
    sort_order: str = Query("desc", pattern="^(asc|desc)$")
):
    return crud.get_entries(
        technology_id=technology_id,
        status=status,
        start_date=start_date,
        end_date=end_date,
        search=search,
        sort_order=sort_order
    )

@app.post("/api/entries", response_model=ProgressEntryResponse, status_code=status.HTTP_201_CREATED)
def create_entry(payload: ProgressEntryCreate):
    try:
        return crud.create_entry(payload.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/entries/{entry_id}", response_model=ProgressEntryResponse)
def get_entry(entry_id: int):
    entry = crud.get_entry_by_id(entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found.")
    return entry

@app.put("/api/entries/{entry_id}", response_model=ProgressEntryResponse)
def update_entry(entry_id: int, payload: ProgressEntryUpdate):
    try:
        updated = crud.update_entry(entry_id, payload.model_dump(exclude_unset=True))
        if not updated:
            raise HTTPException(status_code=404, detail="Entry not found.")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/entries/{entry_id}")
def delete_entry(entry_id: int):
    success = crud.delete_entry(entry_id)
    if not success:
        raise HTTPException(status_code=404, detail="Entry not found.")
    return {"message": "Entry deleted successfully"}

@app.post("/api/entries/reorder")
def reorder_entries(payload: BatchReorderRequest):
    try:
        return crud.batch_reorder([item.model_dump() for item in payload.items])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ----------------- INSIGHTS -----------------

@app.get("/api/insights", response_model=InsightsResponse)
def get_insights():
    return crud.get_insights()

# ----------------- DEMO & BACKUP -----------------

@app.post("/api/demo/seed")
def seed_demo(force: bool = False):
    return seed_demo_data(force=force)

@app.post("/api/demo/clear")
def clear_demo():
    return clear_demo_data()

@app.get("/api/export")
def export_data():
    return crud.export_all()

@app.post("/api/import")
def import_data(payload: dict):
    try:
        return crud.import_all(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to import data: {str(e)}")

# ----------------- STATIC ASSETS / SPA -----------------

frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if frontend_dist.exists() and (frontend_dist / "index.html").exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        file_path = frontend_dist / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
