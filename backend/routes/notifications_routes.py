from datetime import datetime
from typing import Optional
from fastapi import APIRouter
from database import get_db_connection

router = APIRouter(prefix="/api/v1/notifications", tags=["In-App Notifications"])

@router.get("")
def get_notifications(userId: Optional[str] = None, role: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM notifications WHERE 1=1"
    params = []

    if userId:
        query += " AND (user_id = ? OR user_id IS NULL OR role = ?)"
        params.extend([userId, role or "ALL"])
    elif role:
        query += " AND (role = ? OR role = 'ALL' OR user_id IS NULL)"
        params.append(role)

    query += " ORDER BY created_at DESC LIMIT 30"
    cursor.execute(query, params)
    rows = cursor.fetchall()

    notifications = []
    for r in rows:
        notifications.append({
            "id": r["id"],
            "userId": r["user_id"],
            "role": r["role"],
            "title": r["title"],
            "message": r["message"],
            "type": r["type"],
            "category": r["category"],
            "read": bool(r["is_read"]),
            "link": r["link"],
            "createdAt": r["created_at"]
        })

    conn.close()
    return {"notifications": notifications, "unreadCount": sum(1 for n in notifications if not n["read"])}

@router.patch("/{id}/read")
def mark_read(id: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("UPDATE notifications SET is_read = 1 WHERE id = ?", (id,))
    conn.commit()
    conn.close()

    return {"success": True}

@router.post("/read-all")
def mark_all_read(userId: Optional[str] = None, role: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()

    if userId:
        cursor.execute("UPDATE notifications SET is_read = 1 WHERE user_id = ? OR role = ?", (userId, role or ""))
    elif role:
        cursor.execute("UPDATE notifications SET is_read = 1 WHERE role = ?", (role,))
    else:
        cursor.execute("UPDATE notifications SET is_read = 1")

    conn.commit()
    conn.close()

    return {"success": True}
