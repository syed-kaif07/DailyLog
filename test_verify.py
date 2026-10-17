import requests

BASE = 'http://127.0.0.1:8000'

def test_full_workflow():
    # 1. Check frontend root
    r = requests.get(BASE)
    assert r.status_code == 200
    print("[PASS] Frontend served at http://127.0.0.1:8000")

    # 2. Check technologies
    r = requests.get(f'{BASE}/api/technologies')
    assert r.status_code == 200
    techs = r.json()
    print(f"[PASS] Retrieved {len(techs)} technologies")

    docker_tech = next(t for t in techs if t['name'] == 'Docker')
    langgraph_tech = next(t for t in techs if t['name'] == 'LangGraph')

    # 3. Check Docker filter
    r = requests.get(f"{BASE}/api/entries?technology_id={docker_tech['id']}")
    docker_entries = r.json()
    assert len(docker_entries) > 0
    assert all(e['technology_name'] == 'Docker' for e in docker_entries)
    print(f"[PASS] Docker filter returns {len(docker_entries)} Docker entries only")

    # 4. Check LangGraph filter
    r = requests.get(f"{BASE}/api/entries?technology_id={langgraph_tech['id']}")
    lg_entries = r.json()
    assert len(lg_entries) > 0
    assert all(e['technology_name'] == 'LangGraph' for e in lg_entries)
    print(f"[PASS] LangGraph filter returns {len(lg_entries)} LangGraph entries only")

    # 5. Check Create Entry
    payload = {
        'date': '2026-10-17',
        'technology_id': docker_tech['id'],
        'title': 'Docker Swarm Testing',
        'progress_points': [
            'Created multi-node test swarm',
            'Deployed test services',
            'Verified overlay networking'
        ],
        'status': 'Completed',
        'tags': ['docker', 'swarm']
    }
    r = requests.post(f'{BASE}/api/entries', json=payload)
    assert r.status_code == 201
    created = r.json()
    entry_id = created['id']
    print(f"[PASS] Created entry ID {entry_id}: {created['title']}")

    # 6. Check Update Entry
    r = requests.put(f'{BASE}/api/entries/{entry_id}', json={'title': 'Docker Swarm & Overlay Networks'})
    assert r.status_code == 200
    assert r.json()['title'] == 'Docker Swarm & Overlay Networks'
    print(f"[PASS] Updated entry ID {entry_id} successfully")

    # 7. Check Delete Entry
    r = requests.delete(f'{BASE}/api/entries/{entry_id}')
    assert r.status_code == 200
    print(f"[PASS] Deleted entry ID {entry_id} successfully")

    # 8. Check Insights calculations
    r = requests.get(f'{BASE}/api/insights')
    insights = r.json()
    assert insights['total_entries'] >= 20
    assert insights['current_streak'] >= 1
    print(f"[PASS] Insights calculated correctly: Total={insights['total_entries']}, Streak={insights['current_streak']} days, Completion={insights['completion_rate']}%")

    # 9. Check Category Protection: cannot delete category with existing entries
    r = requests.delete(f"{BASE}/api/technologies/{docker_tech['id']}")
    assert r.status_code == 400
    print(f"[PASS] Category protection verified: {r.json().get('detail')}")

    print("\nALL ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!")

if __name__ == '__main__':
    test_full_workflow()
