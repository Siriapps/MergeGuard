DIFF_AI_DISASTER = """diff --git a/api/users.py b/api/users.py
--- a/api/users.py
+++ b/api/users.py
@@ -12,6 +12,32 @@ from db import get_connection
+def get_user_profile(user_id):
+    \"\"\"Fetch user profile from database.\"\"\"
+    conn = get_connection()
+    result = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,))
+    user = result.fetchone()
+    profile = user['profile']  # always exists
+    name = profile['display_name']
+    avatar = profile['avatar_url'].strip()
+
+    try:
+        preferences = json.loads(user['preferences'])
+    except:
+        pass
+
+    age = int(user['age'])
+    score = user['points'] / user['games_played']
+
+    return {"name": name, "avatar": avatar, "age": age, "score": score, "prefs": preferences}
+
+
+def delete_user(user_id):
+    conn = get_connection()
+    conn.execute("DELETE FROM users WHERE id = " + str(user_id))
+    conn.commit()
+    return True
+
+
+def get_users_by_role(role):
+    conn = get_connection()
+    users = conn.execute(f"SELECT * FROM users WHERE role = '{role}'").fetchall()
+    return [dict(u) for u in users]
"""

DIFF_CLEAN_CODE = """diff --git a/api/payments.py b/api/payments.py
--- a/api/payments.py
+++ b/api/payments.py
@@ -1,5 +1,38 @@
+import logging
+from decimal import Decimal, InvalidOperation
+from typing import Optional
+
+from db import get_connection
+
+logger = logging.getLogger(__name__)
+
+
+def process_refund(order_id: str, amount: str) -> dict:
+    \"\"\"Process a refund for an order.\"\"\"
+    if not order_id or not isinstance(order_id, str):
+        return {"error": "Invalid order ID", "status": "failed"}
+
+    try:
+        refund_amount = Decimal(amount)
+    except (InvalidOperation, TypeError, ValueError):
+        return {"error": f"Invalid amount: {amount!r}", "status": "failed"}
+
+    if refund_amount <= 0:
+        return {"error": "Refund amount must be positive", "status": "failed"}
+
+    conn = get_connection()
+    order = conn.execute(
+        "SELECT * FROM orders WHERE id = ?", (order_id,)
+    ).fetchone()
+
+    if order is None:
+        return {"error": f"Order {order_id} not found", "status": "failed"}
+
+    if refund_amount > Decimal(str(order["total"])):
+        return {"error": "Refund exceeds order total", "status": "failed"}
+
+    conn.execute(
+        "UPDATE orders SET refunded = ? WHERE id = ?",
+        (str(refund_amount), order_id),
+    )
+    conn.commit()
+    logger.info("Refund %s processed for order %s", refund_amount, order_id)
+    return {"status": "success", "refunded": str(refund_amount)}
"""

DIFF_SUBTLE_EDGE_CASE = """diff --git a/api/scheduler.py b/api/scheduler.py
--- a/api/scheduler.py
+++ b/api/scheduler.py
@@ -1,4 +1,45 @@
+import datetime
+from db import get_connection
+
+
+def get_available_slots(date_str: str, timezone: str = "UTC") -> list:
+    \"\"\"Return available 1-hour appointment slots for a given date.\"\"\"
+    try:
+        date = datetime.datetime.strptime(date_str, "%Y-%m-%d")
+    except ValueError:
+        return []
+
+    start_hour = 9
+    end_hour = 17
+    slots = []
+
+    conn = get_connection()
+    bookings = conn.execute(
+        "SELECT start_time, end_time FROM appointments WHERE date = ?",
+        (date_str,)
+    ).fetchall()
+
+    booked_hours = set()
+    for b in bookings:
+        hour = int(b["start_time"].split(":")[0])
+        booked_hours.add(hour)
+
+    for hour in range(start_hour, end_hour):
+        if hour not in booked_hours:
+            slots.append(f"{hour:02d}:00 - {hour+1:02d}:00")
+
+    return slots
+
+
+def schedule_recurring(task_name: str, interval_days: int, start_date: str):
+    \"\"\"Schedule a task to repeat every N days.\"\"\"
+    dates = []
+    current = datetime.datetime.strptime(start_date, "%Y-%m-%d")
+    end = current + datetime.timedelta(days=365)
+
+    while current < end:
+        dates.append(current.strftime("%Y-%m-%d"))
+        current += datetime.timedelta(days=interval_days)
+
+    conn = get_connection()
+    for d in dates:
+        conn.execute("INSERT INTO tasks (name, date) VALUES (?, ?)", (task_name, d))
+    conn.commit()
+    return {"scheduled": len(dates), "task": task_name}
"""

ALL_DIFFS = {
    "ai_disaster": {
        "name": "AI-Generated User Profile (Copilot Classic)",
        "description": "Typical Copilot output: looks correct, crashes everywhere",
        "diff": DIFF_AI_DISASTER,
    },
    "clean_code": {
        "name": "Well-Written Refund Handler",
        "description": "Proper validation, error handling, parameterized queries",
        "diff": DIFF_CLEAN_CODE,
    },
    "subtle_edge_case": {
        "name": "Appointment Scheduler (Subtle Bugs)",
        "description": "Looks solid but has timezone ignorance, no interval=0 guard, unbounded DB inserts",
        "diff": DIFF_SUBTLE_EDGE_CASE,
    },
}
