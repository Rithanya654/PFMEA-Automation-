import os
from pathlib import Path
import asyncio
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict
import json

# Initialize FastAPI with CORS
app = FastAPI(title="PFMEA Analysis API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static output file path - make sure this path is correct
STATIC_OUTPUT_FILE = Path("/Users/meena/Desktop/EXPLEO/PFMEA /Base final/PFMEA_final/pfmea_form/backend/Final_PFMEA_Output.xlsx")

@app.post("/upload_MBOM")
async def upload_mbom(
    file: UploadFile = File(...),
    flow_diagram: Optional[UploadFile] = File(None),
    input_params: str = Form(...)
):
    try:
        # Just parse the input params to validate them
        params = json.loads(input_params)
        await asyncio.sleep(1)  # Simulate processing time
        return JSONResponse(content={
            "status": "success",
            "data": {
                "missing_severity": [],
                "missing_control_prevention": [],
                "missing_recommended_action": [],
                "final_data": [],
                "metadata": params
            }
        })
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid input parameters")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/Process_PFMEA")
async def process_fmea_data():
    await asyncio.sleep(2)  # Simulate processing time
    return JSONResponse(content={
        "message": "FMEA processed successfully (static data)",
        "final_data": [],
        "stats": {
            "severity_generated": 0,
            "controls_generated": 0,
            "actions_generated": 0,
            "high_rpn_count": 0
        }
    })

@app.post("/Create_HTML")
async def create_html():
    await asyncio.sleep(1)
    return JSONResponse(content={
        "status": "success",
        "html": "<html><body>Dummy HTML Content</body></html>"
    })

@app.post("/download_excel")
async def download_excel():
    try:
        if not STATIC_OUTPUT_FILE.exists():
            raise HTTPException(status_code=404, detail="Static output file not found")
        
        return FileResponse(
            str(STATIC_OUTPUT_FILE),
            filename="Final_PFMEA.xlsx",
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to return file: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)