import threading
from .notification_queue import notification_queue
from .email_utils import send_email

def notification_worker():
    while True:
        job = notification_queue.get()
        if job:
            send_email(job["to_email"], job["subject"], job["body"])
            notification_queue.task_done()

threading.Thread(target=notification_worker, daemon=True).start()