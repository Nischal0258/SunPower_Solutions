"""
run_server.py — Convenient runner for SunPower Solutions FastAPI Backend.
Usage:
  cd backend
  .\\venv\\Scripts\\python.exe run_server.py
"""

import uvicorn

if __name__ == "__main__":
    print("\n" + "=" * 65)
    print("  SUNPOWER SOLUTIONS SOLAR MANAGEMENT API SERVER")
    print("  Interactive Swagger Docs: http://localhost:8000/docs")
    print("  ReDoc Documentation:     http://localhost:8000/redoc")
    print("  Health Check:             http://localhost:8000/health")
    print("=" * 65 + "\n")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
