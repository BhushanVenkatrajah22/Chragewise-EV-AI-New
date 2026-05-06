from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import uvicorn

app = FastAPI(title="EV Chargewise AI - FastAPI Service")

class TelemetryData(BaseModel):
    vehicleId: str
    speed: float
    soc: float
    voltage: Optional[float] = None
    current: Optional[float] = None
    temperature: Optional[float] = None
    acceleration: Optional[float] = 0.0

@app.get("/")
async def root():
    return {"message": "EV AI FastAPI Service is online"}

@app.post("/analyze")
async def analyze_telemetry(data: TelemetryData):
    # AI Logic Implementation
    
    # 1. Range Prediction (Heuristic: 400km base range)
    predicted_range = (data.soc / 100.0) * 400.0
    
    # 2. Battery Health Score
    health_score = 98.5
    if data.temperature and data.temperature > 45:
        health_score -= 2.0
    if data.current and data.current > 200:
        health_score -= 0.5
        
    # 3. Driving Behavior
    behavior = "Normal"
    if data.acceleration > 5.0:
        behavior = "Aggressive"
    elif data.acceleration < -5.0:
        behavior = "Harsh Braking"
        
    # 4. Alerts
    alerts = []
    if data.soc < 15:
        alerts.append({"type": "LOW_BATTERY", "message": "Battery below 15%."})
    if data.temperature and data.temperature > 50:
        alerts.append({"type": "OVERHEAT", "message": "Battery overheating!"})

    return {
        "range_prediction": round(predicted_range, 1),
        "health_score": round(health_score, 1),
        "driving_behavior": behavior,
        "alerts": alerts,
        "suggestions": "Maintain steady speeds to optimize range." if behavior != "Normal" else "Driving efficiency is optimal."
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
