from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq Client
api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key)

class TelemetryData(BaseModel):
    vehicleId: str
    manufacturer: Optional[str] = "Generic"
    model: Optional[str] = "EV"
    variant: Optional[str] = "Base"
    specs: Optional[dict] = {}
    speed: float
    soc: float
    voltage: Optional[float] = None
    current: Optional[float] = None
    temperature: Optional[float] = None
    acceleration: Optional[float] = 0.0

class VehicleInfo(BaseModel):
    manufacturer: str
    model: str
    variant: str

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
        
        VEHICLE:
        - Manufacturer: {data.manufacturer}
        - Model: {data.model}
        - Variant: {data.variant}
        - Specs: {json.dumps(data.specs)}

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
            model="llama-3.3-70b-versatile",
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

@app.post("/fetch-specs")
async def fetch_vehicle_specs(info: VehicleInfo):
    try:
        prompt = f"""
        Act as an expert Automotive Specification Engine.
        Find and return the official technical specifications for the following Electric Vehicle:
        
        VEHICLE:
        - Manufacturer: {info.manufacturer}
        - Model: {info.model}
        - Variant: {info.variant}
        
        RETURN ONLY A JSON OBJECT with exactly these keys:
        - "batteryCapacity": float (kWh)
        - "batteryVoltage": float (V - nominal pack voltage)
        - "chargingVoltage": float (V - peak charging voltage)
        - "maxChargingSpeed": float (kW)
        - "claimedRange": float (km - ARAI/WLTP)
        - "realWorldRange": float (km - typical real-world estimate)
        - "motorPower": float (kW)
        - "torque": float (Nm)
        - "topSpeed": float (km/h)
        - "coolingType": string (e.g. "Liquid Cooled", "Air Cooled")
        - "weight": float (kg)
        - "year": int (latest production year for this variant)
        - "batteryChemistry": string (e.g. "LFP", "NMC")
        
        If precise data is not found, provide the most accurate industry-standard estimate for this model.
        Do not include any preamble or extra text.
        """

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=1000,
            response_format={"type": "json_object"}
        )

        specs = json.loads(completion.choices[0].message.content)
        return specs

    except Exception as e:
        print(f"Spec Fetch Error: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch vehicle specifications")

class OptionsRequest(BaseModel):
    manufacturer: str
    model: Optional[str] = None

@app.post("/fetch-options")
async def fetch_options(req: OptionsRequest):
    try:
        if not req.model:
            # Fetch models for manufacturer
            prompt = f"List all currently available electric vehicle models for the manufacturer '{req.manufacturer}'. Return ONLY a JSON array of strings. No extra text."
        else:
            # Fetch variants for model
            prompt = f"List all technical variants/trims for the vehicle model '{req.manufacturer} {req.model}'. Return ONLY a JSON array of strings. No extra text."
            
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            response_format={"type": "json_object"}
        )
        
        raw_content = completion.choices[0].message.content
        # Ensure we return a list
        data = json.loads(raw_content)
        # The AI might return {"models": [...]} or {"variants": [...]} or just a list.
        # We'll normalize it.
        result = []
        if isinstance(data, list):
            result = data
        elif isinstance(data, dict):
            # Take the first list found in values
            for val in data.values():
                if isinstance(val, list):
                    result = val
                    break
        
        return result
    except Exception as e:
        print(f"Option Fetch Error: {e}")
        return []

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
