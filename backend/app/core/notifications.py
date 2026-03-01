"""
Notification helper — creates in-app notifications for users.
Import and call `create_notification(db, user_id, ...)` from any endpoint.
"""
from app.models.notification import Notification


def create_notification(
    db,
    user_id: int,
    title: str,
    message: str,
    icon: str = "notifications",
    icon_color: str = "text-blue-600",
    icon_bg: str = "bg-blue-100",
    notification_type: str = "info",
    link: str = None,
):
    """Create a notification for a user and flush to DB."""
    n = Notification(
        user_id=user_id,
        title=title,
        message=message,
        icon=icon,
        icon_color=icon_color,
        icon_bg=icon_bg,
        type=notification_type,
        link=link,
    )
    db.add(n)
    return n
