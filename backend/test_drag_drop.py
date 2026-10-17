import requests

BASE_URL = "http://127.0.0.1:8000/api"

def run_tests():
    print("=== Testing Drag and Drop Reordering Backend API ===")
    
    # 1. Fetch technologies to get an active tech_id
    tech_res = requests.get(f"{BASE_URL}/technologies")
    techs = tech_res.json()
    assert len(techs) > 0, "Need at least one technology"
    tech_id = techs[0]["id"]
    print(f"Using technology ID {tech_id} ({techs[0]['name']})")

    # 2. Create 3 test cards on 2026-10-14
    c1 = requests.post(f"{BASE_URL}/entries", json={
        "date": "2026-10-14",
        "technology_id": tech_id,
        "title": "Test Card Alpha",
        "progress_points": ["Alpha point 1"],
        "status": "In Progress",
        "tags": ["test"]
    }).json()
    
    c2 = requests.post(f"{BASE_URL}/entries", json={
        "date": "2026-10-14",
        "technology_id": tech_id,
        "title": "Test Card Beta",
        "progress_points": ["Beta point 1"],
        "status": "In Progress",
        "tags": ["test"]
    }).json()

    c3 = requests.post(f"{BASE_URL}/entries", json={
        "date": "2026-10-14",
        "technology_id": tech_id,
        "title": "Test Card Gamma",
        "progress_points": ["Gamma point 1"],
        "status": "Completed",
        "tags": ["test"]
    }).json()

    print(f"Created test cards: Alpha({c1['id']}, order={c1['order_index']}), Beta({c2['id']}, order={c2['order_index']}), Gamma({c3['id']}, order={c3['order_index']})")
    assert c1["order_index"] < c2["order_index"] < c3["order_index"], "Auto-assigned order_index must be strictly increasing"

    # 3. Test reordering within the same day: Swap Gamma and Alpha
    reorder_res = requests.post(f"{BASE_URL}/entries/reorder", json={
        "items": [
            {"id": c3["id"], "date": "2026-10-14", "order_index": 0},
            {"id": c2["id"], "date": "2026-10-14", "order_index": 1},
            {"id": c1["id"], "date": "2026-10-14", "order_index": 2},
        ]
    })
    assert reorder_res.status_code == 200, f"Reorder failed: {reorder_res.text}"
    print("Reorder within same day succeeded!")

    # Verify query returns in the new order
    entries_14 = requests.get(f"{BASE_URL}/entries?start_date=2026-10-14&end_date=2026-10-14&sort_order=asc").json()
    ids_order = [e["id"] for e in entries_14 if e["id"] in (c1["id"], c2["id"], c3["id"])]
    print("Queried order on 2026-10-14:", ids_order)
    assert ids_order == [c3["id"], c2["id"], c1["id"]], f"Expected [{c3['id']}, {c2['id']}, {c1['id']}], got {ids_order}"

    # 4. Test moving a card across days: Move Beta (c2) from 2026-10-14 to 2026-10-15
    cross_res = requests.post(f"{BASE_URL}/entries/reorder", json={
        "items": [
            {"id": c2["id"], "date": "2026-10-15", "order_index": 0},
            {"id": c3["id"], "date": "2026-10-14", "order_index": 0},
            {"id": c1["id"], "date": "2026-10-14", "order_index": 1},
        ]
    })
    assert cross_res.status_code == 200, f"Cross-day reorder failed: {cross_res.text}"
    print("Cross-day move succeeded!")

    # Verify card 2 is now on 2026-10-15
    c2_fetched = requests.get(f"{BASE_URL}/entries/{c2['id']}").json()
    assert c2_fetched["date"] == "2026-10-15", f"Expected date 2026-10-15, got {c2_fetched['date']}"
    assert c2_fetched["order_index"] == 0, f"Expected order_index 0, got {c2_fetched['order_index']}"

    # Verify 2026-10-14 now only has c3 and c1
    entries_14_after = requests.get(f"{BASE_URL}/entries?start_date=2026-10-14&end_date=2026-10-14&sort_order=asc").json()
    ids_14 = [e["id"] for e in entries_14_after if e["id"] in (c1["id"], c2["id"], c3["id"])]
    assert ids_14 == [c3["id"], c1["id"]], f"Expected [{c3['id']}, {c1['id']}], got {ids_14}"
    print("Verified: Card successfully moved to 2026-10-15 and removed from 2026-10-14!")

    # 5. Clean up test entries
    for cid in (c1["id"], c2["id"], c3["id"]):
        del_res = requests.delete(f"{BASE_URL}/entries/{cid}")
        assert del_res.status_code == 200

    print("=== All Drag-and-Drop Backend Persistence Tests Passed! ===")

if __name__ == "__main__":
    run_tests()
