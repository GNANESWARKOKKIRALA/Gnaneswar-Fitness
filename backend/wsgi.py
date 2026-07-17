import os
import sys

# Add the backend directory to python search path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from a2wsgi import ASGIMiddleware
from app.main import app

# Lazy initialization wrapper to instantiate ASGIMiddleware inside the child worker process
# after uWSGI has finished pre-forking. This prevents event loop locks.
_wsgi_app = None

def application(environ, start_response):
    global _wsgi_app
    if _wsgi_app is None:
        _wsgi_app = ASGIMiddleware(app)
    return _wsgi_app(environ, start_response)
