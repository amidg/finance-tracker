from pydantic import BaseModel
from datetime import date, datetime
from typing import List, Dict, Any

class TransactionResponse(BaseModel):
    id: int
    date: date
    description: str
    amount_spent: float
    amount_received: float
    tags: str
    created_at: datetime

    class Config:
        from_attributes = True

class KeywordCreate(BaseModel):
    keyword: str
    tag: str

class KeywordResponse(BaseModel):
    id: int
    keyword: str
    tag: str
    created_at: datetime

    class Config:
        from_attributes = True

class ChartData(BaseModel):
    labels: List[str]
    spending_data: List[float]
    income_data: List[float]
    tag_data: Dict[str, float]