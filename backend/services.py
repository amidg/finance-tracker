from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from models import Transaction, Keyword
from typing import List, Dict
from datetime import date
import re
from collections import defaultdict

class TransactionService:
    def __init__(self, db: Session):
        self.db = db

    def create_transaction(self, date: date, description: str, amount_spent: float, amount_received: float, tags: str = ""):
        """Create a new transaction"""
        transaction = Transaction(
            date=date,
            description=description,
            amount_spent=amount_spent,
            amount_received=amount_received,
            tags=tags
        )
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def get_all_transactions(self):
        """Get all transactions"""
        return self.db.query(Transaction).order_by(Transaction.date.desc()).all()

    def get_monthly_chart_data(self, year: int, month: int):
        """Get chart data for a specific month"""
        transactions = self.db.query(Transaction).filter(
            extract('year', Transaction.date) == year,
            extract('month', Transaction.date) == month
        ).all()
        
        return self._process_chart_data(transactions, "daily")

    def get_yearly_chart_data(self, year: int):
        """Get chart data for a specific year"""
        transactions = self.db.query(Transaction).filter(
            extract('year', Transaction.date) == year
        ).all()
        
        return self._process_chart_data(transactions, "monthly")

    def get_all_time_chart_data(self):
        """Get chart data for all time"""
        transactions = self.db.query(Transaction).all()
        return self._process_chart_data(transactions, "yearly")

    def _process_chart_data(self, transactions: List[Transaction], grouping: str):
        """Process transactions into chart data"""
        spending_by_period = defaultdict(float)
        income_by_period = defaultdict(float)
        spending_by_tag = defaultdict(float)
        
        for transaction in transactions:
            if grouping == "daily":
                period = transaction.date.strftime("%Y-%m-%d")
            elif grouping == "monthly":
                period = transaction.date.strftime("%Y-%m")
            else:  # yearly
                period = str(transaction.date.year)
            
            spending_by_period[period] += transaction.amount_spent
            income_by_period[period] += transaction.amount_received
            
            # Process tags for spending
            if transaction.tags and transaction.amount_spent > 0:
                tags = [tag.strip() for tag in transaction.tags.split(',') if tag.strip()]
                if tags:
                    # If transaction has multiple tags, split the amount equally among them
                    amount_per_tag = transaction.amount_spent / len(tags)
                    for tag in tags:
                        spending_by_tag[tag] += amount_per_tag
                else:
                    # If no tags, add to "Untagged" category
                    spending_by_tag["Untagged"] += transaction.amount_spent
            elif transaction.amount_spent > 0:
                # No tags, add to "Untagged" category
                spending_by_tag["Untagged"] += transaction.amount_spent
        
        # Sort periods
        periods = sorted(spending_by_period.keys())
        
        return {
            "labels": periods,
            "spending_data": [spending_by_period[period] for period in periods],
            "income_data": [income_by_period[period] for period in periods],
            "tag_data": dict(spending_by_tag)
        }

class KeywordService:
    def __init__(self, db: Session):
        self.db = db

    def create_keyword(self, keyword: str, tag: str):
        """Create a new keyword"""
        keyword_obj = Keyword(keyword=keyword.lower(), tag=tag)
        self.db.add(keyword_obj)
        self.db.commit()
        self.db.refresh(keyword_obj)
        
        # Update existing transactions with the new keyword
        self._update_all_transaction_tags()
        
        return keyword_obj

    def get_all_keywords(self):
        """Get all keywords"""
        return self.db.query(Keyword).all()

    def delete_keyword(self, keyword_id: int):
        """Delete a keyword"""
        keyword = self.db.query(Keyword).filter(Keyword.id == keyword_id).first()
        if keyword:
            self.db.delete(keyword)
            self.db.commit()
            
            # Update all transactions after removing the keyword
            self._update_all_transaction_tags()

    def find_matching_tags(self, description: str) -> str:
        """Find matching tags for a description based on keywords"""
        description_lower = description.lower()
        keywords = self.db.query(Keyword).all()
        
        matching_tags = set()
        for keyword_obj in keywords:
            if keyword_obj.keyword in description_lower:
                matching_tags.add(keyword_obj.tag)
        
        return ', '.join(sorted(matching_tags))

    def _update_all_transaction_tags(self):
        """Update tags for all transactions based on current keywords"""
        transactions = self.db.query(Transaction).all()
        for transaction in transactions:
            # Find matching tags for the transaction description
            new_tags = self.find_matching_tags(transaction.description)
            # Update transaction tags
            transaction.tags = new_tags
        self.db.commit()