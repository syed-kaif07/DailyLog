import json
import datetime
from typing import List, Optional
from database import get_db

def get_technologies():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT t.id, t.name, t.color, t.created_at,
                   COUNT(e.id) as entry_count
            FROM technologies t
            LEFT JOIN progress_entries e ON t.id = e.technology_id
            GROUP BY t.id
            ORDER BY entry_count DESC, t.name ASC;
        """)
        rows = cursor.fetchall()
        return [
            {
                "id": r["id"],
                "name": r["name"],
                "color": r["color"],
                "created_at": r["created_at"],
                "entry_count": r["entry_count"]
            }
            for r in rows
        ]

def create_technology(name: str, color: str):
    with get_db() as conn:
        cursor = conn.cursor()
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        cursor.execute(
            "INSERT INTO technologies (name, color, created_at) VALUES (?, ?, ?);",
            (name.strip(), color.strip(), now_iso)
        )
        tech_id = cursor.lastrowid
        return {
            "id": tech_id,
            "name": name.strip(),
            "color": color.strip(),
            "created_at": now_iso,
            "entry_count": 0
        }

def update_technology(tech_id: int, name: Optional[str] = None, color: Optional[str] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        updates = []
        params = []
        if name is not None:
            updates.append("name = ?")
            params.append(name.strip())
        if color is not None:
            updates.append("color = ?")
            params.append(color.strip())
        
        if not updates:
            cursor.execute("SELECT * FROM technologies WHERE id = ?;", (tech_id,))
            row = cursor.fetchone()
            if not row:
                return None
            return dict(row)
        
        params.append(tech_id)
        cursor.execute(f"UPDATE technologies SET {', '.join(updates)} WHERE id = ?;", params)
        
        cursor.execute("""
            SELECT t.id, t.name, t.color, t.created_at,
                   COUNT(e.id) as entry_count
            FROM technologies t
            LEFT JOIN progress_entries e ON t.id = e.technology_id
            WHERE t.id = ?
            GROUP BY t.id;
        """, (tech_id,))
        row = cursor.fetchone()
        if not row:
            return None
        return dict(row)

def delete_technology(tech_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        # Safety check: do entries exist?
        cursor.execute("SELECT COUNT(*) FROM progress_entries WHERE technology_id = ?;", (tech_id,))
        count = cursor.fetchone()[0]
        if count > 0:
            raise ValueError(f"Cannot delete category: {count} entries are associated with it. Please reassign or delete the entries first.")
        
        cursor.execute("DELETE FROM technologies WHERE id = ?;", (tech_id,))
        return cursor.rowcount > 0

def format_entry(row):
    return {
        "id": row["id"],
        "date": row["date"],
        "technology_id": row["technology_id"],
        "technology_name": row["technology_name"],
        "technology_color": row["technology_color"],
        "title": row["title"],
        "progress_points": json.loads(row["progress_points"]) if row["progress_points"] else [],
        "status": row["status"],
        "tags": json.loads(row["tags"]) if row["tags"] else [],
        "is_demo": bool(row["is_demo"]),
        "order_index": row["order_index"] if "order_index" in row.keys() else 0,
        "created_at": row["created_at"],
        "updated_at": row["updated_at"]
    }

def get_entries(
    technology_id: Optional[int] = None,
    technology_ids: Optional[List[int]] = None,
    status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    search: Optional[str] = None,
    sort_order: str = "desc"
):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT e.id, e.date, e.technology_id, t.name as technology_name, t.color as technology_color,
                   e.title, e.progress_points, e.status, e.tags, e.is_demo, e.order_index, e.created_at, e.updated_at
            FROM progress_entries e
            JOIN technologies t ON e.technology_id = t.id
            WHERE 1=1
        """
        params = []
        
        if technology_id is not None:
            query += " AND e.technology_id = ?"
            params.append(technology_id)
        elif technology_ids:
            placeholders = ",".join("?" for _ in technology_ids)
            query += f" AND e.technology_id IN ({placeholders})"
            params.extend(technology_ids)
            
        if status:
            query += " AND e.status = ?"
            params.append(status)
            
        if start_date:
            query += " AND e.date >= ?"
            params.append(start_date)
            
        if end_date:
            query += " AND e.date <= ?"
            params.append(end_date)
            
        if search and search.strip():
            term = f"%{search.strip()}%"
            query += " AND (e.title LIKE ? OR e.progress_points LIKE ? OR e.tags LIKE ? OR t.name LIKE ?)"
            params.extend([term, term, term, term])
            
        if sort_order.lower() == "asc":
            query += " ORDER BY e.date ASC, e.order_index ASC, e.id ASC;"
        else:
            query += " ORDER BY e.date DESC, e.order_index ASC, e.id DESC;"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [format_entry(r) for r in rows]

def get_entry_by_id(entry_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT e.id, e.date, e.technology_id, t.name as technology_name, t.color as technology_color,
                   e.title, e.progress_points, e.status, e.tags, e.is_demo, e.order_index, e.created_at, e.updated_at
            FROM progress_entries e
            JOIN technologies t ON e.technology_id = t.id
            WHERE e.id = ?;
        """, (entry_id,))
        row = cursor.fetchone()
        if not row:
            return None
        return format_entry(row)

def create_entry(data: dict):
    with get_db() as conn:
        cursor = conn.cursor()
        # Verify technology exists
        cursor.execute("SELECT id FROM technologies WHERE id = ?;", (data["technology_id"],))
        if not cursor.fetchone():
            raise ValueError(f"Technology ID {data['technology_id']} does not exist.")
            
        # Get next order_index for this date
        cursor.execute("SELECT COALESCE(MAX(order_index), -1) + 1 FROM progress_entries WHERE date = ?;", (data["date"],))
        next_order = cursor.fetchone()[0]
        
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        cursor.execute("""
            INSERT INTO progress_entries 
            (date, technology_id, title, progress_points, status, tags, is_demo, order_index, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?);
        """, (
            data["date"],
            data["technology_id"],
            data["title"].strip(),
            json.dumps(data["progress_points"]),
            data["status"],
            json.dumps(data.get("tags", [])),
            next_order,
            now_iso,
            now_iso
        ))
        entry_id = cursor.lastrowid
        
    return get_entry_by_id(entry_id)

def update_entry(entry_id: int, data: dict):
    with get_db() as conn:
        cursor = conn.cursor()
        updates = []
        params = []
        
        if "date" in data and data["date"] is not None:
            updates.append("date = ?")
            params.append(data["date"])
        if "technology_id" in data and data["technology_id"] is not None:
            # Check tech exists
            cursor.execute("SELECT id FROM technologies WHERE id = ?;", (data["technology_id"],))
            if not cursor.fetchone():
                raise ValueError(f"Technology ID {data['technology_id']} does not exist.")
            updates.append("technology_id = ?")
            params.append(data["technology_id"])
        if "title" in data and data["title"] is not None:
            updates.append("title = ?")
            params.append(data["title"].strip())
        if "progress_points" in data and data["progress_points"] is not None:
            updates.append("progress_points = ?")
            params.append(json.dumps(data["progress_points"]))
        if "status" in data and data["status"] is not None:
            updates.append("status = ?")
            params.append(data["status"])
        if "tags" in data and data["tags"] is not None:
            updates.append("tags = ?")
            params.append(json.dumps(data["tags"]))
        if "order_index" in data and data["order_index"] is not None:
            updates.append("order_index = ?")
            params.append(data["order_index"])
            
        if updates:
            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
            updates.append("updated_at = ?")
            params.append(now_iso)
            params.append(entry_id)
            cursor.execute(f"UPDATE progress_entries SET {', '.join(updates)} WHERE id = ?;", params)
        
    return get_entry_by_id(entry_id)

def batch_reorder(items: List[dict]):
    with get_db() as conn:
        cursor = conn.cursor()
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        for item in items:
            cursor.execute("""
                UPDATE progress_entries
                SET date = ?, order_index = ?, updated_at = ?
                WHERE id = ?;
            """, (item["date"], item["order_index"], now_iso, item["id"]))
        return {"updated_count": len(items)}


def delete_entry(entry_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM progress_entries WHERE id = ?;", (entry_id,))
        return cursor.rowcount > 0

def get_insights():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Total entries
        cursor.execute("SELECT COUNT(*) FROM progress_entries;")
        total_entries = cursor.fetchone()[0]
        
        # Unique active days
        cursor.execute("SELECT COUNT(DISTINCT date) FROM progress_entries;")
        unique_active_days = cursor.fetchone()[0]
        
        # This week entries (Mon to Sun)
        today = datetime.date.today()
        # Monday of current week
        monday = today - datetime.timedelta(days=today.weekday())
        sunday = monday + datetime.timedelta(days=6)
        cursor.execute(
            "SELECT COUNT(*) FROM progress_entries WHERE date >= ? AND date <= ?;",
            (monday.isoformat(), sunday.isoformat())
        )
        this_week_entries = cursor.fetchone()[0]
        
        # By status
        cursor.execute("SELECT status, COUNT(*) as count FROM progress_entries GROUP BY status;")
        status_map = {"Completed": 0, "In Progress": 0, "Planned": 0}
        for row in cursor.fetchall():
            if row["status"] in status_map:
                status_map[row["status"]] = row["count"]
                
        completed_count = status_map["Completed"]
        completion_rate = round((completed_count / total_entries * 100), 1) if total_entries > 0 else 0.0
        
        # By technology
        cursor.execute("""
            SELECT t.id, t.name, t.color, COUNT(e.id) as count
            FROM technologies t
            JOIN progress_entries e ON t.id = e.technology_id
            GROUP BY t.id
            ORDER BY count DESC;
        """)
        tech_rows = cursor.fetchall()
        by_technology = []
        for r in tech_rows:
            pct = round((r["count"] / total_entries * 100), 1) if total_entries > 0 else 0.0
            by_technology.append({
                "id": r["id"],
                "name": r["name"],
                "color": r["color"],
                "count": r["count"],
                "percentage": pct
            })
            
        # Current logging streak calculation (looking back from today or yesterday)
        cursor.execute("SELECT DISTINCT date FROM progress_entries ORDER BY date DESC;")
        logged_dates = {datetime.date.fromisoformat(r["date"]) for r in cursor.fetchall()}
        
        streak = 0
        curr = today
        # If no entry today, check if yesterday was logged to continue streak
        if curr not in logged_dates:
            curr = today - datetime.timedelta(days=1)
            
        while curr in logged_dates:
            streak += 1
            curr -= datetime.timedelta(days=1)
            
        # Recent activity (past 14 days activity list)
        recent_activity = []
        for i in range(13, -1, -1):
            d = (today - datetime.timedelta(days=i)).isoformat()
            cursor.execute("SELECT COUNT(*) FROM progress_entries WHERE date = ?;", (d,))
            cnt = cursor.fetchone()[0]
            recent_activity.append({"date": d, "count": cnt})
            
        return {
            "total_entries": total_entries,
            "this_week_entries": this_week_entries,
            "unique_active_days": unique_active_days,
            "current_streak": streak,
            "completion_rate": completion_rate,
            "by_status": {
                "completed": status_map["Completed"],
                "in_progress": status_map["In Progress"],
                "planned": status_map["Planned"]
            },
            "by_technology": by_technology,
            "recent_activity": recent_activity
        }

def export_all():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM technologies;")
        techs = [dict(r) for r in cursor.fetchall()]
        
        cursor.execute("""
            SELECT e.id, e.date, e.technology_id, t.name as technology_name,
                   e.title, e.progress_points, e.status, e.tags, e.created_at, e.updated_at
            FROM progress_entries e
            JOIN technologies t ON e.technology_id = t.id
            ORDER BY e.date ASC;
        """)
        entries = []
        for r in cursor.fetchall():
            entries.append({
                "id": r["id"],
                "date": r["date"],
                "technology_name": r["technology_name"],
                "title": r["title"],
                "progress_points": json.loads(r["progress_points"]) if r["progress_points"] else [],
                "status": r["status"],
                "tags": json.loads(r["tags"]) if r["tags"] else [],
                "created_at": r["created_at"],
                "updated_at": r["updated_at"]
            })
            
        return {
            "exported_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "technologies": techs,
            "entries": entries
        }

def import_all(data: dict):
    with get_db() as conn:
        cursor = conn.cursor()
        imported_entries = 0
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        # Import technologies
        tech_map = {}
        for t in data.get("technologies", []):
            cursor.execute("SELECT id FROM technologies WHERE name = ?;", (t["name"],))
            existing = cursor.fetchone()
            if existing:
                tech_map[t["name"]] = existing["id"]
            else:
                cursor.execute(
                    "INSERT INTO technologies (name, color, created_at) VALUES (?, ?, ?);",
                    (t["name"], t.get("color", "#64748b"), t.get("created_at", now_iso))
                )
                tech_map[t["name"]] = cursor.lastrowid
                
        # Import entries
        for e in data.get("entries", []):
            tech_name = e.get("technology_name")
            tech_id = tech_map.get(tech_name)
            if not tech_id:
                cursor.execute(
                    "INSERT INTO technologies (name, color, created_at) VALUES (?, ?, ?);",
                    (tech_name or "Others", "#64748b", now_iso)
                )
                tech_id = cursor.lastrowid
                if tech_name:
                    tech_map[tech_name] = tech_id
                    
            cursor.execute("""
                INSERT INTO progress_entries
                (date, technology_id, title, progress_points, status, tags, is_demo, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?);
            """, (
                e["date"],
                tech_id,
                e["title"],
                json.dumps(e["progress_points"]),
                e.get("status", "Completed"),
                json.dumps(e.get("tags", [])),
                e.get("created_at", now_iso),
                e.get("updated_at", now_iso)
            ))
            imported_entries += 1
            
        return {"imported_entries": imported_entries}
