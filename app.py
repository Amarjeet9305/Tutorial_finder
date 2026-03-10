from flask import Flask, render_template, request
from utils.youtube_api import search_youtube_tutorials
from utils.scraper import scrape_trusted_sites
from utils.ai_helper import analyze_query, generate_learning_path
from utils.db import save_search_query
import config

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/search', methods=['GET', 'POST'])
def search():
    if request.method == 'POST':
        query    = request.form.get('query', '').strip()
        domain   = request.form.get('domain', '')
        duration = request.form.get('duration', 'any')
        order    = request.form.get('order', 'relevance')

        # AI Integration
        ai_learning_path = generate_learning_path(query)
        optimized_query = analyze_query(query)
        
        # Use optimized query if different, else fallback to original
        search_term = optimized_query if optimized_query else query

        youtube_results = search_youtube_tutorials(
            search_term, domain,
            duration=duration,
            order=order
        )
        other_results = scrape_trusted_sites(search_term, domain)
        
        # Save search to database silently
        save_search_query(query, search_term if search_term != query else None, ai_learning_path)

        return render_template('search.html',
                               query=query,
                               optimized_query=search_term if search_term != query else None,
                               domain=domain,
                               duration=duration,
                               order=order,
                               youtube_results=youtube_results,
                               other_results=other_results,
                               ai_learning_path=ai_learning_path)

    return render_template('search.html')

if __name__ == '__main__':
    app.run(debug=True)