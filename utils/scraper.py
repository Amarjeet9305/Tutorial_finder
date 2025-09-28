import requests
from bs4 import BeautifulSoup

TRUSTED_SITES = {
    'freecodecamp': 'https://www.freecodecamp.org/news/search/?query={query}',
    'udemy': 'https://www.udemy.com/courses/search/?q={query}',
    'coursera': 'https://www.coursera.org/search?query={query}',
    'edx': 'https://www.edx.org/search?q={query}'
}

def scrape_trusted_sites(query, domain=None):
    results = []
    
    for site, url_template in TRUSTED_SITES.items():
        try:
            url = url_template.format(query=f"{query} {domain}" if domain else query)
            response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Site-specific scraping logic
            if site == 'freecodecamp':
                articles = soup.select('.post-card')
                for article in articles[:3]:  # Limit to 3 results per site
                    title = article.select_one('.post-card-title').text.strip()
                    link = 'https://www.freecodecamp.org' + article['href']
                    results.append({
                        'title': title,
                        'link': link,
                        'source': 'FreeCodeCamp'
                    })
            
            # Add similar logic for other sites...
            
        except Exception as e:
            print(f"Error scraping {site}: {e}")
    
    return results