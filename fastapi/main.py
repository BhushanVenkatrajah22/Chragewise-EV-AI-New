from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import uvicorn
from groq import Groq
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="EV Chargewise AI - Groq Intelligence Service")

# Initialize Groq Client
api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key)

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
    return {"message": "EV AI Groq Service is online"}

@app.post("/analyze")
async def analyze_telemetry(data: TelemetryData):
    try:
        # Construct the AI Prompt based on raw OBD-II data
        prompt = f"""
        Act as an expert Automotive AI Intelligence System for an EV.
        Analyze the following raw OBD-II telemetry data and provide professional, concise insights.
        
        DATA:
        - Speed: {data.speed} km/h
        - State of Charge (SoC): {data.soc}%
        - Voltage: {data.voltage}V
        - Current: {data.current}A
        - Battery Temp: {data.temperature}°C
        - Acceleration G-force: {data.acceleration}
        
        RETURN ONLY A JSON OBJECT with exactly these keys:
        - "predicted_range": float (km remaining)
        - "health_score": float (0-100 based on temp/voltage)
        - "behavior": string (one word: Smooth, Aggressive, Efficient, or Harsh)
        - "ai_diagnostic": string (one sentence diagnostic of the hardware state)
        - "coach_advice": string (one sentence advice for the driver)
        - "risk_level": string (Low, Medium, or High)
        
        Do not include any preamble or extra text.
        """

        completion = client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=500,
            response_format={"type": "json_object"}
        )

        ai_response = json.loads(completion.choices[0].message.content)
        return ai_response

    except Exception as e:
        print(f"Error: {e}")
        # Fallback if AI fails
        return {
            "predicted_range": (data.soc / 100.0) * 400.0,
            "health_score": 98.0,
            "behavior": "Stable",
            "ai_diagnostic": "AI Service Temporarily Offline. Analyzing locally.",
            "coach_advice": "Maintain current speed for optimal efficiency.",
            "risk_level": "Low"
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
