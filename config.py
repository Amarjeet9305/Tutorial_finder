import os

# YouTube API Key
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY', 'AIzaSyASJ0C_BKQDJiVUdQJJMGZsooNb1NC4R8A')

# Flask secret key
SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key')

# Other configuration settings
DEBUG = True