from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import io
from typing import List, Dict
from datetime import datetime
import uvicorn
import os

from database import get_db, init_db
from models import Transaction, Keyword
from schemas import TransactionResponse, KeywordCreate, KeywordResponse, ChartData
from services import TransactionService, KeywordService

app = FastAPI(title="Finance Tracker API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

@app.get("/")
async def root():
    return {"message": "Finance Tracker API"}

@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...), db = Depends(get_db)):
    """Upload and process CSV file with transactions"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Validate CSV structure
        expected_columns = ['date', 'description', 'amount_spent', 'amount_received']
        if len(df.columns) < 4:
            raise HTTPException(
                status_code=400, 
                detail=f"CSV must have at least 4 columns: {', '.join(expected_columns)}"
            )
        
        # Rename columns to expected names
        df.columns = expected_columns[:len(df.columns)]
        
        # Process transactions
        transaction_service = TransactionService(db)
        keyword_service = KeywordService(db)
        
        created_transactions = []
        for _, row in df.iterrows():
            try:
                # Parse date
                date = pd.to_datetime(row['date']).date()
                
                # Auto-tag based on keywords
                tags = keyword_service.find_matching_tags(row['description'])
                
                transaction = transaction_service.create_transaction(
                    date=date,
                    description=row['description'],
                    amount_spent=float(row['amount_spent']) if pd.notna(row['amount_spent']) else 0.0,
                    amount_received=float(row['amount_received']) if pd.notna(row['amount_received']) else 0.0,
                    tags=tags
                )
                created_transactions.append(transaction)
            except Exception as e:
                print(f"Error processing row {row}: {e}")
                continue
        
        return {
            "message": f"Successfully uploaded {len(created_transactions)} transactions",
            "transactions": len(created_transactions)
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing CSV: {str(e)}")

@app.get("/transactions", response_model=List[TransactionResponse])
async def get_transactions(db = Depends(get_db)):
    """Get all transactions"""
    transaction_service = TransactionService(db)
    return transaction_service.get_all_transactions()

@app.get("/keywords", response_model=List[KeywordResponse])
async def get_keywords(db = Depends(get_db)):
    """Get all keywords"""
    keyword_service = KeywordService(db)
    return keyword_service.get_all_keywords()

@app.post("/keywords", response_model=KeywordResponse)
async def create_keyword(keyword: KeywordCreate, db = Depends(get_db)):
    """Create a new keyword"""
    keyword_service = KeywordService(db)
    return keyword_service.create_keyword(keyword.keyword, keyword.tag)

@app.delete("/keywords/{keyword_id}")
async def delete_keyword(keyword_id: int, db = Depends(get_db)):
    """Delete a keyword"""
    keyword_service = KeywordService(db)
    keyword_service.delete_keyword(keyword_id)
    return {"message": "Keyword deleted successfully"}

@app.get("/charts/monthly")
async def get_monthly_chart_data(year: int, month: int, db = Depends(get_db)):
    """Get chart data for a specific month"""
    transaction_service = TransactionService(db)
    return transaction_service.get_monthly_chart_data(year, month)

@app.get("/charts/yearly")
async def get_yearly_chart_data(year: int, db = Depends(get_db)):
    """Get chart data for a specific year"""
    transaction_service = TransactionService(db)
    return transaction_service.get_yearly_chart_data(year)

@app.get("/charts/all-time")
async def get_all_time_chart_data(db = Depends(get_db)):
    """Get chart data for all time"""
    transaction_service = TransactionService(db)
    return transaction_service.get_all_time_chart_data()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)