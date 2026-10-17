import requests
import time

BASE = 'http://127.0.0.1:8000'

def test_clean_start():
    print("--- 1. Testing clean empty state after restart ---")
    
    # 1. Technologies must be 0
    res = requests.get(f'{BASE}/api/technologies')
    assert res.status_code == 200
    techs = res.json()
    print(f"Technologies count: {len(techs)}")
    assert len(techs) == 0, f"Expected 0 technologies, got {len(techs)}"
    print("[PASS] Verified 0 technologies on startup (no automatic seeding)")

    # 2. Entries must be 0
    res = requests.get(f'{BASE}/api/entries')
    assert res.status_code == 200
    entries = res.json()
    print(f"Entries count: {len(entries)}")
    assert len(entries) == 0, f"Expected 0 entries, got {len(entries)}"
    print("[PASS] Verified 0 entries on startup (no automatic seeding)")

    # 3. Insights must handle 0 without error
    res = requests.get(f'{BASE}/api/insights')
    assert res.status_code == 200
    insights = res.json()
    print("Insights:", insights)
    assert insights['total_entries'] == 0
    assert insights['current_streak'] == 0
    assert insights['completion_rate'] == 0.0
    assert len(insights['by_technology']) == 0
    print("[PASS] Verified insights calculation with 0 entries")

    print("\n--- 2. Testing user custom category creation ---")
    cat_payload = {'name': 'PyTorch', 'color': '#7c3aed'}
    res = requests.post(f'{BASE}/api/technologies', json=cat_payload)
    assert res.status_code == 201
    created_tech = res.json()
    tech_id = created_tech['id']
    print(f"[PASS] Successfully created custom category: {created_tech['name']} (ID: {tech_id})")

    print("\n--- 3. Testing progress entry creation with category ---")
    entry_payload = {
        'date': '2026-10-17',
        'technology_id': tech_id,
        'title': 'Distributed Data Parallel (DDP) Setup',
        'progress_points': [
            'Configured torchrun multi-GPU launcher',
            'Wrapped model in DistributedDataParallel',
            'Benchmarked throughput on 2 GPUs'
        ],
        'status': 'Completed',
        'tags': ['pytorch', 'ddp', 'gpu']
    }
    res = requests.post(f'{BASE}/api/entries', json=entry_payload)
    assert res.status_code == 201
    created_entry = res.json()
    entry_id = created_entry['id']
    print(f"[PASS] Successfully created entry: {created_entry['title']} (ID: {entry_id})")

    # 4. Verify category entry count and filter
    res = requests.get(f'{BASE}/api/technologies')
    tech_list = res.json()
    assert tech_list[0]['entry_count'] == 1
    print("[PASS] Category entry_count updated to 1")

    res = requests.get(f'{BASE}/api/entries?technology_id={tech_id}')
    assert len(res.json()) == 1
    print("[PASS] Filtering by category works cleanly")

    # 5. Clean up the test record so the user begins with a completely empty database
    res = requests.delete(f'{BASE}/api/entries/{entry_id}')
    assert res.status_code == 200
    res = requests.delete(f'{BASE}/api/technologies/{tech_id}')
    assert res.status_code == 200
    print("[PASS] Cleaned up temporary test record")

    # Final check
    assert len(requests.get(f'{BASE}/api/technologies').json()) == 0
    assert len(requests.get(f'{BASE}/api/entries').json()) == 0
    print("[PASS] Final verification: Database is 100% clean and ready for user!")

if __name__ == '__main__':
    test_clean_start()
