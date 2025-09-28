# Import Flask class and necessary functions from flask module
from flask import Flask, render_template, request, jsonify
# Import custom functions for YouTube API searches
from utils.youtube_api import search_youtube_tutorials
# Import custom functions for web scraping
from utils.scraper import scrape_trusted_sites
# Import configuration settings
import config

# Create an instance of the Flask class
# __name__ tells Flask where to look for templates and static files
app = Flask(__name__)

# Define route for the home page ('/' is the root URL)
@app.route('/')
def home():
    # Render and return the index.html template
    return render_template('index.html')

# Define route for search functionality that accepts both GET and POST methods
@app.route('/search', methods=['GET', 'POST'])
def search():
    # Check if the request method is POST (form submission)
    if request.method == 'POST':
        # Get search query from form data
        query = request.form.get('query')
        # Get domain filter from form data
        domain = request.form.get('domain')
        
        # Call YouTube API search function with query and domain
        youtube_results = search_youtube_tutorials(query, domain)
        
        # Call web scraping function for other tutorial sites
        other_results = scrape_trusted_sites(query, domain)
        
        # Render search.html template with all results
        return render_template('search.html', 
                             query=query,
                             youtube_results=youtube_results,
                             other_results=other_results)
    
    # For GET requests, just render the empty search page
    return render_template('search.html')

# Define dynamic route for tutorial details pages
# <tutorial_id> is a variable part of the URL
@app.route('/tutorial/<tutorial_id>')
def tutorial_details(tutorial_id):
    # Render tutorial.html template and pass the tutorial_id
    return render_template('tutorial.html', tutorial_id=tutorial_id)

# Standard Python check to see if this is the main program
if __name__ == '__main__':
    # Run the Flask development server
    # debug=True enables auto-reloader and debugger
    app.run(debug=True)