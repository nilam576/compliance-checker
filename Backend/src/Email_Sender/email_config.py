import os
from dotenv import load_dotenv

load_dotenv()


EMAIL_HOST=os.getenv("EMAIL_HOST")
# EMAIL_HOST = "smtp.gmail.com"  
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")
