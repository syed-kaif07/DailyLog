from pydantic import BaseModel, Field, field_validator
from typing import List, Optional

class TechnologyBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    color: str = Field(..., min_length=4, max_length=20)

class TechnologyCreate(TechnologyBase):
    pass

class TechnologyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    color: Optional[str] = Field(None, min_length=4, max_length=20)

class TechnologyResponse(TechnologyBase):
    id: int
    created_at: str
    entry_count: int = 0

class ProgressEntryBase(BaseModel):
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    technology_id: int
    title: str = Field(..., min_length=1, max_length=200)
    progress_points: List[str] = Field(default_factory=list)
    status: str = Field(..., pattern=r"^(Planned|In Progress|Completed)$")
    tags: List[str] = Field(default_factory=list)

    @field_validator("progress_points")
    @classmethod
    def validate_points(cls, v):
        trimmed = [p.strip() for p in v if p and p.strip()]
        if not trimmed:
            raise ValueError("At least one non-empty progress point is required.")
        return trimmed

    @field_validator("title")
    @classmethod
    def validate_title(cls, v):
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Title cannot be empty or only whitespace.")
        return trimmed

class ProgressEntryCreate(ProgressEntryBase):
    pass

class ProgressEntryUpdate(BaseModel):
    date: Optional[str] = Field(None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    technology_id: Optional[int] = None
    title: Optional[str] = None
    progress_points: Optional[List[str]] = None
    status: Optional[str] = Field(None, pattern=r"^(Planned|In Progress|Completed)$")
    tags: Optional[List[str]] = None
    order_index: Optional[int] = None

    @field_validator("progress_points")
    @classmethod
    def validate_points(cls, v):
        if v is not None:
            trimmed = [p.strip() for p in v if p and p.strip()]
            if not trimmed:
                raise ValueError("At least one non-empty progress point is required.")
            return trimmed
        return v

    @field_validator("title")
    @classmethod
    def validate_title(cls, v):
        if v is not None:
            trimmed = v.strip()
            if not trimmed:
                raise ValueError("Title cannot be empty or only whitespace.")
            return trimmed
        return v

class ProgressEntryResponse(BaseModel):
    id: int
    date: str
    technology_id: int
    technology_name: str
    technology_color: str
    title: str
    progress_points: List[str]
    status: str
    tags: List[str]
    is_demo: bool
    order_index: int = 0
    created_at: str
    updated_at: str

class ReorderItem(BaseModel):
    id: int
    date: str
    order_index: int

class BatchReorderRequest(BaseModel):
    items: List[ReorderItem]

class TechnologyStats(BaseModel):
    id: int
    name: str
    color: str
    count: int
    percentage: float

class StatusStats(BaseModel):
    completed: int
    in_progress: int
    planned: int

class InsightsResponse(BaseModel):
    total_entries: int
    this_week_entries: int
    unique_active_days: int
    current_streak: int
    completion_rate: float
    by_status: StatusStats
    by_technology: List[TechnologyStats]
    recent_activity: List[dict]
