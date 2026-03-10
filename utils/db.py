from pymongo import MongoClient
import config
from datetime import datetime

# Initialize database connection lazily
_client = None
_db = None

def get_db():
    global _client, _db
    if _db is not None:
        return _db
    
    try:
        if config.MONGO_URI:
            _client = MongoClient(config.MONGO_URI, serverSelectionTimeoutMS=2000)
            # Use the database name specified in the URI, or default to 'Tutorial.ai'
            _db = _client.get_database()
            return _db
    except Exception as e:
        print(f"MongoDB Connection Error: {e}")
    
    return None

def save_search_query(user_query, optimized_query, ai_learning_path):
    """
    Saves the user's search data to MongoDB.
    Fails silently if the database is unreachable to avoid breaking the user experience.
    """
    db = get_db()
    if db is None:
        return
    
    try:
        search_history = db.search_history
        doc = {
            "query": user_query,
            "optimized_query": optimized_query,
            "ai_learning_path_generated": bool(ai_learning_path),
            "timestamp": datetime.utcnow()
        }
        search_history.insert_one(doc)
    except Exception as e:
        print(f"Error saving to MongoDB: {e}")
