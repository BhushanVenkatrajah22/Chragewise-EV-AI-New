# Start FastAPI AI Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd fastapi; .\venv\Scripts\python main.py"

# Start Node Backend Server
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd node; npm start"

# Start Next.js Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd next; npm run dev"
