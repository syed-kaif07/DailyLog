import json
import datetime
from database import get_db

DEMO_ENTRIES = [
    # Mon (Oct 12, 2026)
    {
        "date": "2026-10-12",
        "tech": "Python",
        "title": "Two pointers pattern",
        "points": [
            "Solved 3 LeetCode problems",
            "Understood edge cases",
            "Wrote key takeaways"
        ],
        "status": "Completed",
        "tags": ["dsa", "leetcode", "algorithms"]
    },
    {
        "date": "2026-10-12",
        "tech": "LangGraph",
        "title": "StateGraph basics",
        "points": [
            "Read documentation",
            "Created simple graph",
            "Tested conditional edges"
        ],
        "status": "Completed",
        "tags": ["langgraph", "agents", "graphs"]
    },
    {
        "date": "2026-10-12",
        "tech": "RAG",
        "title": "RAG evaluation",
        "points": [
            "Set up Ragas",
            "Ran first evaluation",
            "Analyzed faithfulness score"
        ],
        "status": "In Progress",
        "tags": ["rag", "ragas", "metrics"]
    },
    {
        "date": "2026-10-12",
        "tech": "System Design",
        "title": "High level design practice",
        "points": [
            "Watched video on HLD",
            "Made notes on components",
            "Plan to draw architecture tomorrow"
        ],
        "status": "Planned",
        "tags": ["architecture", "hld"]
    },
    # Tue (Oct 13, 2026)
    {
        "date": "2026-10-13",
        "tech": "Docker",
        "title": "Docker fundamentals",
        "points": [
            "Watched official docs",
            "Built and ran a container",
            "Practiced volume mounting"
        ],
        "status": "Completed",
        "tags": ["devops", "containers"]
    },
    {
        "date": "2026-10-13",
        "tech": "FastAPI",
        "title": "FastAPI CRUD app",
        "points": [
            "Created basic API",
            "Connected to SQLite",
            "Tested endpoints with Postman"
        ],
        "status": "In Progress",
        "tags": ["backend", "api"]
    },
    {
        "date": "2026-10-13",
        "tech": "Python",
        "title": "Dictionary problems",
        "points": [
            "Solved 2 medium questions",
            "Revised set and dict operations",
            "Wrote notes"
        ],
        "status": "Completed",
        "tags": ["dsa", "hashmap"]
    },
    # Wed (Oct 14, 2026)
    {
        "date": "2026-10-14",
        "tech": "RAG",
        "title": "LlamaParse ingestion",
        "points": [
            "Parsed 5 research papers",
            "Generated markdown",
            "Inspected chunking results"
        ],
        "status": "Completed",
        "tags": ["rag", "llamaindex", "pdf"]
    },
    {
        "date": "2026-10-14",
        "tech": "LangGraph",
        "title": "Node & tool integration",
        "points": [
            "Understood tool calling",
            "Built a simple tool node",
            "Tested with dummy data"
        ],
        "status": "In Progress",
        "tags": ["langgraph", "tools"]
    },
    {
        "date": "2026-10-14",
        "tech": "Docker",
        "title": "Dockerfile & deployment",
        "points": [
            "Wrote Dockerfile",
            "Built image successfully",
            "Pushed to Docker Hub"
        ],
        "status": "Completed",
        "tags": ["docker", "containers"]
    },
    {
        "date": "2026-10-14",
        "tech": "System Design",
        "title": "LLM system design",
        "points": [
            "Read design patterns",
            "Made notes on RAG architecture",
            "Plan to create a diagram"
        ],
        "status": "Planned",
        "tags": ["system-design", "llm"]
    },
    # Thu (Oct 15, 2026)
    {
        "date": "2026-10-15",
        "tech": "SQL",
        "title": "Joins and subqueries",
        "points": [
            "Solved 5 problems",
            "Practiced window functions",
            "Revised important queries"
        ],
        "status": "Completed",
        "tags": ["sql", "databases"]
    },
    {
        "date": "2026-10-15",
        "tech": "RAG",
        "title": "Hybrid search",
        "points": [
            "Implemented BM25",
            "Combined with vector search",
            "Testing RRF"
        ],
        "status": "In Progress",
        "tags": ["rag", "bm25", "search"]
    },
    {
        "date": "2026-10-15",
        "tech": "Python",
        "title": "OOP concepts",
        "points": [
            "Revised classes and inheritance",
            "Solved 2 OOP problems",
            "Updated notes"
        ],
        "status": "Completed",
        "tags": ["python", "oop"]
    },
    # Fri (Oct 16, 2026)
    {
        "date": "2026-10-16",
        "tech": "Agentic AI",
        "title": "Agent architectures",
        "points": [
            "Read about agents vs workflows",
            "Compared LangGraph and CrewAI",
            "Made notes"
        ],
        "status": "Completed",
        "tags": ["ai-agents", "crewai"]
    },
    {
        "date": "2026-10-16",
        "tech": "LangGraph",
        "title": "Multi-agent workflow",
        "points": [
            "Designed 3 agent flow",
            "Implemented supervisor",
            "Testing handoffs"
        ],
        "status": "In Progress",
        "tags": ["langgraph", "multi-agent"]
    },
    {
        "date": "2026-10-16",
        "tech": "RAG",
        "title": "Evaluation & metrics",
        "points": [
            "Ran Ragas evaluation",
            "Checked faithfulness & relevancy",
            "Wrote observations"
        ],
        "status": "Completed",
        "tags": ["rag", "evaluation"]
    },
    # Sat (Oct 17, 2026)
    {
        "date": "2026-10-17",
        "tech": "Python",
        "title": "Python interview prep",
        "points": [
            "Solved 2 array problems",
            "Revised common questions",
            "Made a list of 50 questions"
        ],
        "status": "In Progress",
        "tags": ["python", "interview"]
    },
    {
        "date": "2026-10-17",
        "tech": "Docker",
        "title": "Docker Compose",
        "points": [
            "Created docker-compose.yml",
            "Ran multi-container setup",
            "Understood networking"
        ],
        "status": "Completed",
        "tags": ["docker", "compose"]
    },
    # Sun (Oct 18, 2026)
    {
        "date": "2026-10-18",
        "tech": "System Design",
        "title": "Design an AI agent system",
        "points": [
            "Read reference blogs",
            "Understood key components",
            "Plan to draw full architecture"
        ],
        "status": "Planned",
        "tags": ["system-design", "ai"]
    }
]

def seed_demo_data(force=False):
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check if demo data already seeded
        cursor.execute("SELECT COUNT(*) FROM progress_entries WHERE is_demo = 1;")
        demo_count = cursor.fetchone()[0]
        if demo_count > 0 and not force:
            return {"message": "Demo data already exists", "count": demo_count}
        
        # Fetch technologies map: name -> id
        cursor.execute("SELECT id, name FROM technologies;")
        tech_map = {row["name"]: row["id"] for row in cursor.fetchall()}
        
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        inserted = 0
        for entry in DEMO_ENTRIES:
            tech_name = entry["tech"]
            tech_id = tech_map.get(tech_name)
            if not tech_id:
                # Insert missing tech
                cursor.execute(
                    "INSERT INTO technologies (name, color, created_at) VALUES (?, ?, ?);",
                    (tech_name, "#64748b", now_iso)
                )
                tech_id = cursor.lastrowid
                tech_map[tech_name] = tech_id
            
            cursor.execute(
                """
                INSERT INTO progress_entries 
                (date, technology_id, title, progress_points, status, tags, is_demo, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?);
                """,
                (
                    entry["date"],
                    tech_id,
                    entry["title"],
                    json.dumps(entry["points"]),
                    entry["status"],
                    json.dumps(entry.get("tags", [])),
                    now_iso,
                    now_iso
                )
            )
            inserted += 1
            
        return {"message": f"Successfully seeded {inserted} demo entries", "count": inserted}

def clear_demo_data():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM progress_entries WHERE is_demo = 1;")
        deleted = cursor.rowcount
        return {"message": f"Cleared {deleted} demo entries", "deleted": deleted}
