"""
utils/knowledge.py
Real-time knowledge fetching from Wikipedia and web sources
"""

import requests
import json
import re


def fetch_wikipedia_summary(topic: str, sentences: int = 5) -> str:
    """Fetch summary from Wikipedia API."""
    try:
        # Clean the topic for URL
        clean_topic = topic.strip().replace(" ", "_")

        url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{clean_topic}"
        r = requests.get(url, timeout=5, headers={
            "User-Agent": "AIVideoChatAgent/1.0"
        })

        if r.status_code == 200:
            data = r.json()
            extract = data.get("extract", "")
            if extract:
                return extract
    except Exception as e:
        print(f"  ⚠️ Wikipedia fetch failed: {e}")

    return ""


def fetch_wikipedia_detailed(topic: str) -> dict:
    """Fetch detailed Wikipedia info including sections."""
    result = {
        "summary": "",
        "sections": [],
        "related": [],
        "url": "",
    }

    try:
        clean_topic = topic.strip().replace(" ", "_")

        # Get summary
        url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{clean_topic}"
        r = requests.get(url, timeout=5, headers={
            "User-Agent": "AIVideoChatAgent/1.0"
        })

        if r.status_code == 200:
            data = r.json()
            result["summary"] = data.get("extract", "")
            result["url"] = data.get("content_urls", {}).get(
                "desktop", {}).get("page", "")

        # Search if direct lookup fails
        if not result["summary"]:
            search_url = "https://en.wikipedia.org/w/api.php"
            params = {
                "action": "query",
                "list": "search",
                "srsearch": topic,
                "format": "json",
                "srlimit": 3,
            }
            r = requests.get(search_url, params=params, timeout=5)
            if r.status_code == 200:
                search_data = r.json()
                results = search_data.get("query", {}).get("search", [])
                if results:
                    # Get the first result's summary
                    title = results[0]["title"].replace(" ", "_")
                    url2 = f"https://en.wikipedia.org/api/rest_v1/page/summary/{title}"
                    r2 = requests.get(url2, timeout=5)
                    if r2.status_code == 200:
                        result["summary"] = r2.json().get("extract", "")

                    result["related"] = [r["title"] for r in results[1:]]

    except Exception as e:
        print(f"  ⚠️ Wikipedia detailed fetch failed: {e}")

    return result


def search_web_knowledge(query: str) -> str:
    """
    Aggregate knowledge from multiple free sources.
    Returns combined context string.
    """
    parts = []

    # Wikipedia
    wiki = fetch_wikipedia_summary(query)
    if wiki:
        parts.append(f"Wikipedia: {wiki}")

    # Try DuckDuckGo instant answer
    try:
        ddg_url = "https://api.duckduckgo.com/"
        params = {"q": query, "format": "json", "no_html": 1, "skip_disambig": 1}
        r = requests.get(ddg_url, params=params, timeout=5)
        if r.status_code == 200:
            data = r.json()
            abstract = data.get("AbstractText", "")
            if abstract:
                parts.append(f"DuckDuckGo: {abstract}")

            # Related topics
            related = data.get("RelatedTopics", [])
            for rt in related[:3]:
                if isinstance(rt, dict) and "Text" in rt:
                    parts.append(f"Related: {rt['Text']}")
    except Exception:
        pass

    return "\n\n".join(parts) if parts else ""


def enrich_topic(topic: str) -> dict:
    """
    Build enriched knowledge context for a topic.
    Returns dict with structured info.
    """
    wiki_data = fetch_wikipedia_detailed(topic)
    web_data = search_web_knowledge(topic)

    return {
        "topic": topic,
        "wikipedia_summary": wiki_data.get("summary", ""),
        "related_topics": wiki_data.get("related", []),
        "web_context": web_data,
        "has_knowledge": bool(wiki_data.get("summary") or web_data),
    }