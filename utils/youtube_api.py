from googleapiclient.discovery import build
import config

# Map UI duration labels -> YouTube API videoDuration values
DURATION_MAP = {
    'any':    None,       # don't send the param = all lengths
    'short':  'short',   # < 4 min
    'medium': 'medium',  # 4-20 min
    'long':   'long',    # > 20 min
}

# Map UI sort labels -> YouTube API order values
ORDER_MAP = {
    'relevance': 'relevance',
    'viewCount': 'viewCount',
    'date':      'date',
    'rating':    'rating',
}

def search_youtube_tutorials(query, domain=None, max_results=10,
                              duration='any', order='relevance'):
    youtube = build('youtube', 'v3', developerKey=config.YOUTUBE_API_KEY)

    # Append domain keyword if provided
    if domain:
        query = f"{query} {domain} tutorial"

    # Build base params
    params = dict(
        q=query,
        part='id,snippet',
        maxResults=max_results,
        type='video',
        order=ORDER_MAP.get(order, 'relevance'),
        relevanceLanguage='en'
    )

    # Only add videoDuration when a specific length is chosen
    yt_duration = DURATION_MAP.get(duration)
    if yt_duration:
        params['videoDuration'] = yt_duration

    response = youtube.search().list(**params).execute()

    tutorials = []
    for item in response['items']:
        video_id = item['id']['videoId']
        snippet = item['snippet']
        tutorials.append({
            'id': video_id,
            'title':       snippet['title'],
            'channel':     snippet['channelTitle'],
            'description': snippet['description'],
            'thumbnail':   snippet['thumbnails']['high']['url'],
            'url':         f'https://www.youtube.com/watch?v={video_id}'
        })

    return tutorials