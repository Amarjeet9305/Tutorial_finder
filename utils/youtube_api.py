from googleapiclient.discovery import build
import config

def search_youtube_tutorials(query, domain=None, max_results=10):
    youtube = build('youtube', 'v3', developerKey=config.YOUTUBE_API_KEY)
    
    # Add domain-specific keywords if provided
    if domain:
        query = f"{query} {domain} tutorial"
    
    request = youtube.search().list(
        q=query,
        part='id,snippet',
        maxResults=max_results,
        type='video',
        videoDuration='medium',  # Filter for medium-length tutorials
        order='viewCount',      # Sort by most viewed
        relevanceLanguage='en'
    )
    
    response = request.execute()
    
    # Process the results
    tutorials = []
    for item in response['items']:
        video_id = item['id']['videoId']
        snippet = item['snippet']
        
        tutorial = {
            'id': video_id,
            'title': snippet['title'],
            'channel': snippet['channelTitle'],
            'description': snippet['description'],
            'thumbnail': snippet['thumbnails']['high']['url'],
            'url': f'https://www.youtube.com/watch?v={video_id}'
        }
        tutorials.append(tutorial)
    
    return tutorials