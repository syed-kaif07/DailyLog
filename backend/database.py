import sqlite3
import os
from contextlib import contextmanager
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "buildlog.db"

@contextmanager
def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Technologies table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS technologies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                color TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
        """)
        
        # Entries table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS progress_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                technology_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                progress_points TEXT NOT NULL, -- JSON array of strings
                status TEXT NOT NULL CHECK(status IN ('Planned', 'In Progress', 'Completed')),
                tags TEXT NOT NULL DEFAULT '[]', -- JSON array of strings
                is_demo INTEGER NOT NULL DEFAULT 0,
                order_index INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (technology_id) REFERENCES technologies(id) ON DELETE RESTRICT
            );
        """)
        
        # Migration: add order_index if missing in existing database
        cursor.execute("PRAGMA table_info(progress_entries);")
        columns = [row["name"] for row in cursor.fetchall()]
        if "order_index" not in columns:
            cursor.execute("ALTER TABLE progress_entries ADD COLUMN order_index INTEGER NOT NULL DEFAULT 0;")

        # Indexes for fast querying & filtering
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_entries_date ON progress_entries(date);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_entries_tech ON progress_entries(technology_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_entries_status ON progress_entries(status);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_entries_order ON progress_entries(date, order_index);")


