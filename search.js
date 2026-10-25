// Web Search Helper using DuckDuckGo HTML & MDN Web Docs search
// Performs real-time web retrieval to provide grounding context for local LLM

async function searchWeb(query, maxResults = 5) {
  try {
    const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.warn('Search returned status:', response.status);
      return [];
    }

    const html = await response.text();
    const results = [];

    // Extract title, url, and snippet
    const resultBlocks = html.split('<div class="result results_links');
    for (let i = 1; i < resultBlocks.length && results.length < maxResults; i++) {
      const block = resultBlocks[i];

      // Title & URL
      const titleMatch = block.match(/<a class="result__url"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i) ||
                         block.match(/<a class="result__snippet[^>]*href="([^"]+)"/i);
      
      const snippetMatch = block.match(/<a class="result__snippet[^>]*>([\s\S]*?)<\/a>/i);

      if (snippetMatch) {
        const rawSnippet = snippetMatch[1].replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&').trim();
        results.push({
          snippet: rawSnippet
        });
      }
    }

    return results;
  } catch (err) {
    console.warn('Web search failed (offline or network timeout):', err.message);
    return [];
  }
}

module.exports = { searchWeb };
