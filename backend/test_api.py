import requests
import os
import time
import subprocess

def run_integration_test():
    print("Starting API Integration Test...")
    base_url = "http://127.0.0.1:8000"
    
    # 1. Check health
    try:
        r = requests.get(f"{base_url}/")
        print("Health Check Response:", r.json())
    except Exception as e:
        print("FastAPI is not running. Let's start the server first in this script, or make sure it is running.")
        return False

    # 2. Register first user (automatically becomes admin)
    admin_payload = {
        "name": "Admin Coach",
        "email": "admin@antigravityfit.com",
        "phone": "9876543210",
        "password": "securepassword123"
    }
    r = requests.post(f"{base_url}/api/auth/register", json=admin_payload)
    if r.status_code in [200, 201]:
        print("Admin user registered successfully!")
    elif r.status_code == 400:
        print("Admin user already registered (skipping registration).")
    else:
        print("Failed to register Admin:", r.text)
        return False

    # 3. Register a regular user
    user_payload = {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "1234567890",
        "password": "userpassword123"
    }
    r = requests.post(f"{base_url}/api/auth/register", json=user_payload)
    if r.status_code in [200, 201]:
        print("Regular user registered successfully!")
    elif r.status_code == 400:
        print("Regular user already registered (skipping registration).")
    else:
        print("Failed to register user:", r.text)
        return False

    # 4. Login as Admin to get token
    r = requests.post(f"{base_url}/api/auth/login", json={
        "email": "admin@antigravityfit.com",
        "password": "securepassword123"
    })
    if r.status_code != 200:
        print("Admin Login failed:", r.text)
        return False
    admin_data = r.json()
    admin_token = admin_data["access_token"]
    print("Admin logged in successfully!")

    # 5. Login as regular User to get token
    r = requests.post(f"{base_url}/api/auth/login", json={
        "email": "john@example.com",
        "password": "userpassword123"
    })
    if r.status_code != 200:
        print("User Login failed:", r.text)
        return False
    user_data = r.json()
    user_token = user_data["access_token"]
    print("User logged in successfully!")

    # 6. Retrieve programs catalog
    r = requests.get(f"{base_url}/api/programs")
    if r.status_code != 200:
        print("Failed to get programs:", r.text)
        return False
    programs = r.json()
    print(f"Retrieved {len(programs)} programs from catalog.")
    if not programs:
        print("No programs found in database.")
        return False
    target_program = programs[0]
    print(f"Targeting program: {target_program['title']} (Price: ${target_program['price']})")

    # 7. Create a mock screenshot image file to upload
    mock_screenshot_path = "mock_screenshot.jpg"
    with open(mock_screenshot_path, "wb") as f:
        f.write(b"MOCK IMAGE DATA")

    # 8. User uploads payment screenshot for the program
    files = {
        'screenshot': (mock_screenshot_path, open(mock_screenshot_path, 'rb'), 'image/jpeg')
    }
    data = {
        'plan_id': target_program['id'],
        'amount': target_program['price']
    }
    headers = {
        'Authorization': f'Bearer {user_token}'
    }
    
    r = requests.post(f"{base_url}/api/orders", data=data, files=files, headers=headers)
    # clean up file handle
    files['screenshot'][1].close()
    if os.path.exists(mock_screenshot_path):
        os.remove(mock_screenshot_path)

    if r.status_code != 200:
        print("Failed to submit order:", r.text)
        return False
    
    order = r.json()
    order_id = order["id"]
    print(f"Order submitted successfully! Order ID: {order_id}, Status: {order['status']}")

    # 9. Admin lists orders to find the pending order
    admin_headers = {
        'Authorization': f'Bearer {admin_token}'
    }
    r = requests.get(f"{base_url}/api/admin/orders", headers=admin_headers)
    if r.status_code != 200:
        print("Admin failed to list orders:", r.text)
        return False
    orders_list = r.json()
    print(f"Admin found {len(orders_list)} total orders in queue.")

    # 10. Admin approves the order
    r = requests.post(f"{base_url}/api/admin/orders/{order_id}/approve", headers=admin_headers)
    if r.status_code != 200:
        print("Admin failed to approve order:", r.text)
        return False
    print("Admin approved the order successfully!")

    # 11. User checks their unlocked plans
    r = requests.get(f"{base_url}/api/plans/me", headers=headers)
    if r.status_code != 200:
        print("User failed to retrieve unlocked plans:", r.text)
        return False
    unlocked = r.json()
    print(f"User has {len(unlocked)} unlocked plans.")
    if len(unlocked) == 0:
        print("Error: Plan was approved but is not showing up in unlocked list.")
        return False
    print("Plan is active in User account!")

    # 12. User logs progress entry
    progress_payload = {
        "date": "2026-07-15",
        "weight": 79.2,
        "measurements": '{"chest": 41.2, "biceps": 15.4}'
    }
    r = requests.post(f"{base_url}/api/progress", json=progress_payload, headers=headers)
    if r.status_code != 200:
        print("Failed to log progress:", r.text)
        return False
    print("Logged progress entry successfully!")

    # 13. User calls AI workout planner (verifying fallback response)
    ai_workout_payload = {
        "goal": "muscle gain",
        "level": "intermediate",
        "equipment": "full gym"
    }
    r = requests.post(f"{base_url}/api/ai/workout-plan", json=ai_workout_payload, headers=headers)
    if r.status_code != 200:
        print("Failed to call AI Workout Planner:", r.text)
        return False
    ai_w_res = r.json()
    print("AI Workout Plan generated (source:", ai_w_res.get("source"), ")")

    # 14. User calls AI diet planner
    ai_diet_payload = {
        "goal": "muscle gain",
        "diet_type": "non-vegetarian",
        "target_calories": 2800
    }
    r = requests.post(f"{base_url}/api/ai/diet-plan", json=ai_diet_payload, headers=headers)
    if r.status_code != 200:
        print("Failed to call AI Diet Planner:", r.text)
        return False
    ai_d_res = r.json()
    print("AI Diet Plan generated (source:", ai_d_res.get("source"), ")")

    print("\n--- ALL TESTS COMPLETED SUCCESSFULLY ---")
    return True

if __name__ == "__main__":
    run_integration_test()
