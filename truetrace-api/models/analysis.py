from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime


class DetectorResult(BaseModel):
    detector: str
    result: Literal["Pass", "Fail", "Warning"]
    details: str
    score: float  # 0 = clean, 100 = manipulated / synthetic


class DebugImages(BaseModel):
    ela: str       # base64 data URI
    noiseMap: str  # base64 data URI


class AnalysisResult(BaseModel):
    """Response model - matches the frontend AnalysisResult TypeScript type."""
    results: list[DetectorResult]
    finalScore: float      # 0-100, high = authentic (e.g. 90% authentic)
    verdict: str           # "AI Generated", "Tampered Document", "Clear Signs of Manipulation", "Possibly Edited", "Likely Authentic"
    isAiGenerated: bool = False
    category: str = "general" # "ai_generated", "document_tampered", "manipulated_image", "authentic"
    confidence: float = 85.0
    summary: str = ""
    debugImages: DebugImages


class AnalysisDocument(BaseModel):
    """MongoDB document schema for storing analysis history."""
    fileHash: str
    fileName: str
    fileSizeKB: float
    mimeType: str
    uploadedAt: datetime = Field(default_factory=datetime.utcnow)
    finalScore: float
    verdict: str
    isAiGenerated: bool = False
    category: str = "general"
    results: list[DetectorResult]
    ipHash: str = ""
    shareToken: str = ""
