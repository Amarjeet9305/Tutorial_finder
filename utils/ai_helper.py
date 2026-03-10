import os
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import config

def get_llm():
    """Initializes and returns the ChatOpenAI model."""
    if not config.OPENAI_API_KEY or config.OPENAI_API_KEY == 'your-openai-api-key-here':
        return None
    return ChatOpenAI(temperature=0.7, openai_api_key=config.OPENAI_API_KEY, model="gpt-3.5-turbo")

def analyze_query(user_query):
    """
    Uses LLM to extract a clean, optimized search phrase from a complex user query.
    If LLM is unavailable, returns the original query.
    """
    llm = get_llm()
    if not llm:
        return user_query
    
    prompt = PromptTemplate(
        input_variables=["query"],
        template="""
        You are an expert at optimizing search queries for tutorial platforms like YouTube and freeCodeCamp.
        Given the following complex user query, extract the core technical topics and return a short, clean search phrase (max 3-4 words) that will yield the best tutorial results. Do not include extra conversational text, just the search phrase.
        
        User Query: {query}
        Optimized Search Phrase:
        """
    )
    
    chain = LLMChain(llm=llm, prompt=prompt)
    try:
        optimized_phrase = chain.run(query=user_query).strip().strip('"\'')
        return optimized_phrase
    except Exception as e:
        print(f"Error optimizing query: {e}")
        return user_query

def generate_learning_path(user_query):
    """
    Uses LLM to generate a short personalized learning path based on the user's query.
    If LLM is unavailable, returns None.
    """
    llm = get_llm()
    if not llm:
        return None
    
    prompt = PromptTemplate(
        input_variables=["query"],
        template="""
        You are an expert educational mentor. A student has asked to learn the following:
        "{query}"
        
        Provide a very concise, structured learning path for them to get started. 
        Format your response in simple markdown (use bullet points or numbered lists, bold text for emphasis). 
        Keep it encouraging, actionable, and under 150 words.
        """
    )
    
    chain = LLMChain(llm=llm, prompt=prompt)
    try:
        path = chain.run(query=user_query)
        return path
    except Exception as e:
        print(f"Error generating learning path: {e}")
        return None
