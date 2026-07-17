import os
import sys

# Add the backend directory to python search path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from a2wsgi import ASGIMiddleware
from app.main import app

# a2wsgi translates FastAPI's ASGI interface to WSGI for PythonAnywhere web servers
application = ASGIMiddleware(app)
