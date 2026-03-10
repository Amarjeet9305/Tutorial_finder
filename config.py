import os

# YouTube API Key
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY', 'AIzaSyASJ0C_BKQDJiVUdQJJMGZsooNb1NC4R8A')

# OpenAI API Key
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# MongoDB URI
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/Tutorial.ai')

# Flask secret key
SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key')

# Other configuration settings
DEBUG = True