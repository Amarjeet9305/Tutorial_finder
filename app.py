from flask import Flask, render_template, request, jsonify
from utils.youtube_api import search_youtube_tutorials
from utils.scraper import scrape_trusted_sites
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

        youtube_results = search_youtube_tutorials(
            query, domain,
            duration=duration,
            order=order
        )
        other_results = scrape_trusted_sites(query, domain)

        return render_template('search.html',
                               query=query,
                               domain=domain,
                               duration=duration,
                               order=order,
                               youtube_results=youtube_results,
                               other_results=other_results)

    return render_template('search.html')

@app.route('/tutorial/<tutorial_id>')
def tutorial_details(tutorial_id):
    return render_template('tutorial.html', tutorial_id=tutorial_id)

if __name__ == '__main__':
    app.run(debug=True)