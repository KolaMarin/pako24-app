import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { chromium, firefox, Route, Request } from 'playwright'; // Import firefox, Route and Request

// Cache for previously scraped sites to avoid redundant scraping
const CACHE_EXPIRY = 15 * 60 * 1000; // 15 minutes
type CacheEntry = {
  timestamp: number;
  data: ProductData; // Use defined type
};
const productCache = new Map<string, CacheEntry>();

// Define a type for the extracted product data
type ProductData = {
  price: number | null;
  title: string;
  size: string;
  color: string;
};

// Helper function to check if data is sufficient
function hasSufficientData(data: ProductData | null): boolean {
    return !!data && (!!data.price || !!data.title);
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = url;
    const cachedResult = productCache.get(cacheKey);
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_EXPIRY) {
      console.log('Using cached product data for:', url);
      return NextResponse.json(cachedResult.data);
    }

    // Multi-stage scraping approach
    let productData: ProductData | null = null;
    let html = '';
    // let screenshotBase64 = ''; // Removed screenshot logic

    // Stage 1: Try basic fetch and extraction (Check if Playwright is needed)
    try {
      console.log('Attempting basic fetch for:', url);
      html = await fetchWithRetry(url);
      const $ = cheerio.load(html);
      const needsPlaywright = isLikelyDynamicSite($, html, url);
      if (needsPlaywright) {
         console.log('Site likely dynamic, proceeding to Playwright.');
         html = ''; // Clear HTML so Playwright runs
      } else {
         console.log('Basic fetch sufficient, proceeding directly to AI extraction.');
         // Keep html from basic fetch
      }
    } catch (error) {
      console.error('Basic fetch error, falling back to Playwright:', error);
      html = ''; // Ensure Playwright runs if fetch fails
    }

    // Stage 2: Use Playwright if basic fetch failed or site is dynamic
    if (!html) { // Only run Playwright if needed
        try {
            console.log('Using Playwright for:', url);
            const playwrightResult = await scrapeWithPlaywright(url);
            html = playwrightResult.html; // Update HTML with Playwright result
            console.log('Playwright finished, proceeding to AI extraction.');
        } catch (error) {
            console.error('Playwright scraping error:', error);
             // If Playwright failed completely to get content, return error
             if (!html) { // Check if html is still empty after potential partial success in scrapeWithPlaywright
                 console.error('Playwright failed to retrieve HTML content.');
                 return NextResponse.json(
                    { error: 'Failed to retrieve page content using Playwright' },
                    { status: 500 }
                 );
             }
             console.log('Playwright failed, but attempting AI fallback with potentially captured HTML.');
        }
    }

    // Stage 3: AI Extraction (Now the primary method after getting HTML)
    productData = null; // Reset before AI attempt
    console.log('Attempting AI extraction...');

    if (process.env.DEEPSEEK_API_KEY && html) { // Only run if API key exists AND we have HTML
        console.log('Attempting DeepSeek HTML analysis...');
        try {
            productData = await extractWithDeepSeekHtml(html, url); // Use the simplified function
            console.log('Data extracted via DeepSeek HTML:', productData);
        } catch(error) {
             console.error('Error during DeepSeek HTML analysis:', error);
             productData = null; // Ensure data is null on error
        }
    } else if (!html) {
         console.warn('Skipping DeepSeek HTML analysis as no HTML content was retrieved.');
    } else {
         console.warn('DEEPSEEK_API_KEY not configured, skipping DeepSeek HTML analysis.');
    }

    // Final check and cache update
    if (hasSufficientData(productData)) {
        console.log('Final extracted data:', productData);
        productCache.set(cacheKey, { timestamp: Date.now(), data: productData! });
        return NextResponse.json(productData);
    } else {
        console.error('Failed to extract sufficient product information after all stages for URL:', url);
        const finalData: ProductData = { price: null, title: '', size: '', color: '' };
        // Optionally cache failure: productCache.set(cacheKey, { timestamp: Date.now(), data: finalData });
        return NextResponse.json(finalData);
    }

  } catch (error) {
    console.error('Unhandled product scraping error:', error);
    return NextResponse.json(
      { error: 'Failed to scrape product information due to an unexpected error' },
      { status: 500 }
    );
  }
}

// --- Helper Functions ---

/**
 * Determines if a site is likely a dynamic JavaScript application
 */
function isLikelyDynamicSite($: cheerio.CheerioAPI, html: string, url: string): boolean {
  // Check for SPA frameworks or dynamic loading indicators
  const jsSpaSignatures = [
    'ReactDOM', '_reactRootContainer', 'Vue.', 'ng-app',
    'data-reactroot', '__NEXT_DATA__', '__NUXT__',
    'window.__INITIAL_STATE__', 'window.__PRELOADED_STATE__'
  ];
  const hasSpaSignatures = jsSpaSignatures.some(signature => html.includes(signature));
  const hasMinimalContent = $('body').text().trim().length < 1000;
  const hasDynamicLoading = html.includes('xhr.open') || html.includes('fetch(') || html.includes('.ajax(');
  const isKnownDynamicSite = [
    'zara.com', 'uniqlo.com', 'hm.com', 'asos.com', 'zalando.com',
    'farfetch', 'ssense', 'nordstrom', 'macys', 'nike', 'adidas',
    'apple.com/shop', 'microsoft.com/store'
  ].some(domain => url.includes(domain));
  return hasSpaSignatures || hasMinimalContent || hasDynamicLoading || isKnownDynamicSite;
}

/**
 * Fetch HTML with retry mechanism
 */
async function fetchWithRetry(url: string): Promise<string> {
  const MAX_RETRIES = 3;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(15000)
      });

      if (response.ok) {
        return await response.text();
      } else {
         console.warn(`Fetch attempt ${attempt + 1} failed with status: ${response.status}`);
         if (response.status >= 400 && response.status < 500) {
             throw new Error(`Client error fetching URL: ${response.status}`);
         }
      }
      if (attempt < MAX_RETRIES - 1) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        console.log(`Retrying fetch in ${backoffMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    } catch (error: any) {
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
          console.error(`Fetch attempt ${attempt + 1} timed out.`);
      } else {
          console.error(`Fetch attempt ${attempt + 1} failed:`, error);
      }
      if (attempt === MAX_RETRIES - 1) throw error;
    }
  }
  throw new Error('Failed to fetch after multiple attempts');
}

/**
 * Scrape with Playwright for difficult sites
 */
async function scrapeWithPlaywright(url: string): Promise<{ html: string }> {
  let browser = null;
  let htmlContent = ''; // Variable to store HTML even if errors occur later
  try {
    console.log('Launching Firefox via Playwright...');
    browser = await firefox.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
      viewport: { width: 1280, height: 800 }
    });

    await context.route('**/*', (route: Route, request: Request) => {
        const blockedDomains = [
            'google-analytics.com', 'googletagmanager.com', 'facebook.net',
            'analytics.google.com', 'adservice.google.com', 'doubleclick.net',
            'connect.facebook.net', 'platform.twitter.com', 'ads-twitter.com',
            'criteo.com', 'scorecardresearch.com', 'adobedtm.com'
          ];
          if (blockedDomains.some(domain => request.url().includes(domain))) {
              route.abort();
          } else {
              route.continue();
          }
      });

    const page = await context.newPage();
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    });

    console.log(`Navigating to ${url} with Playwright...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    console.log('Page navigation complete (DOM loaded).');

    await page.waitForTimeout(Math.random() * 2000 + 1500);

    console.log('Scrolling page...');
    await page.evaluate(() => { window.scrollBy(0, document.body.scrollHeight / 3); });
    await page.waitForTimeout(500);
    await page.evaluate(() => { window.scrollBy(0, document.body.scrollHeight / 3); });
    await page.waitForTimeout(500);
    console.log('Waiting for network idle after scrolling...');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => console.log('Network idle timeout after scroll, continuing...'));
    console.log('Network idle or timeout reached.');

    console.log('Getting HTML content...');
    htmlContent = await page.content(); // Store content before potential close errors

    console.log('Playwright scraping successful.');
    return { html: htmlContent };
  } catch (error) {
      console.error(`Playwright error during scrapeWithPlaywright for ${url}:`, error);
      // Return potentially captured HTML even if an error occurred later
      if (htmlContent) {
          console.log('Returning partially captured HTML due to Playwright error.');
          return { html: htmlContent };
      }
      throw error; // Rethrow if no HTML was captured at all
  } finally {
    if (browser) {
      await browser.close().catch(e => console.error("Error closing browser:", e)); // Catch close errors
      console.log('Playwright Firefox browser closed.');
    }
  }
}

/**
 * Extract product info using DeepSeek AI (HTML Analysis)
 * This version simplifies HTML preprocessing and relies more on the AI.
 */
async function extractWithDeepSeekHtml(html: string, url: string): Promise<ProductData> {
  if (!process.env.DEEPSEEK_API_KEY) {
    console.warn('DEEPSEEK_API_KEY not configured, skipping DeepSeek HTML analysis.');
    return { price: null, title: '', size: '', color: '' };
  }

  console.log('Preparing HTML for DeepSeek (Simplified Approach)...');
  const $ = cheerio.load(html);

  // 1. Extract JSON-LD structured data (if available)
  let structuredDataJson = '';
  try {
    const jsonldScripts = $('script[type="application/ld+json"]');
    console.log(`Found ${jsonldScripts.length} JSON-LD script blocks`);
    jsonldScripts.each((i, el) => {
      try {
        const jsonText = $(el).html();
        if (!jsonText) return;
        const jsonData = JSON.parse(jsonText);
        // Check if it's product-related JSON-LD
        if (jsonData['@type'] === 'Product' || jsonData.mainEntity?.['@type'] === 'Product' || (Array.isArray(jsonData['@graph']) && jsonData['@graph'].some(item => item['@type'] === 'Product'))) {
          structuredDataJson += `<script type="application/ld+json">${JSON.stringify(jsonData)}</script>\n`;
        }
      } catch (e) { /* Ignore parsing errors for individual scripts */ }
    });
    if (structuredDataJson) {
      console.log('Extracted JSON-LD data.');
    }
  } catch (e) {
    console.error('Error processing JSON-LD:', e);
  }

  // 2. Get the main body content and clean it minimally
  // Remove scripts (except JSON-LD), styles, header, footer, nav, aside
  $('script:not([type="application/ld+json"]), style, link, meta, noscript, header, footer, nav, aside, iframe').remove();
  // Remove common non-content sections
  $('.cookie-banner, .newsletter-signup, .site-footer, .global-footer, #sidebar, .sidebar, [role="navigation"], [role="complementary"], [role="banner"], [role="contentinfo"]').remove();

  let bodyHtml = $('body').html() || '';

  // Combine JSON-LD with the cleaned body HTML
  let finalHtmlPayload = structuredDataJson + bodyHtml;

  console.log(`Final HTML payload length for DeepSeek: ${finalHtmlPayload.length} characters`);

  // Limit HTML size
  const MAX_HTML_LENGTH = 30000; // Adjusted limit
  const truncatedHtml = finalHtmlPayload.length > MAX_HTML_LENGTH ? finalHtmlPayload.substring(0, MAX_HTML_LENGTH) + '...' : finalHtmlPayload;

  // Save the input being sent to DeepSeek
  //try {
  //  const fs = require('fs');
  //  const path = require('path');
  //  const timestamp = new Date().toISOString().replace(/:/g, '-');
  //  const urlSegment = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  //  const filename = `deepseek_input_${urlSegment}_${timestamp}.html`;
  //  const filePath = path.join(process.cwd(), 'app/api/scrape-product', filename);
  //  fs.writeFileSync(filePath, truncatedHtml);
  //  console.log(`DeepSeek input saved to: ${filename}`);
  //} catch (error) {
  //  console.error('Error saving DeepSeek input to file:', error);
  //}
  
  // Call DeepSeek API
  try {
    console.log('Calling DeepSeek API...');
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `You are an expert at extracting product information from e-commerce website HTML.
            You have been given HTML content which includes the main body of the page (with scripts, styles, headers, footers removed) and any relevant JSON-LD structured data found.
            Analyze the provided HTML to extract the following information:

            1.  **Product price**:
                *   Extract ONLY the numeric value (e.g., 49.99).
                *   Prioritize the current/final price. Ignore "was" or comparison prices.
                *   If multiple prices seem relevant, choose the most prominent one.
                *   Return null if no price is found.
            2.  **Product title**:
                *   Extract the main product name.
                *   Be concise and avoid including brand names unless part of the core title.
                *   Return an empty string if not found.
            3.  **Selected size**:
                *   Identify the size that is currently SELECTED or ACTIVE. Look for visual cues like class="selected", class="active", aria-selected="true", aria-checked="true", or specific styling (like a border).
                *   Examples: 'XL', 'M', '32', '8.5 UK'.
                *   Return an empty string if no size is selected or found.
            4.  **Selected color**:
                *   Identify the color that is currently SELECTED or ACTIVE using similar cues as size (selected/active classes, ARIA states, styling).
                *   Examples: 'Blue', 'Black/White', 'Forest Green'.
                *   Return an empty string if no color is selected or found.

            Return ONLY a valid JSON object with these properties:
            {
              "price": number | null,
              "title": string,
              "size": string,
              "color": string
            }

            The URL being processed is: ${url}`
          },
          {
            role: "user",
            content: `Extract product details from this HTML content for the page ${url}:\n\n${truncatedHtml}`
          }
        ],
        temperature: 0.1,
        max_tokens: 500,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      console.error('DeepSeek API error:', response.status, await response.text());
      throw new Error(`DeepSeek API request failed with status ${response.status}`);
    }

    const result = await response.json();

    if (!result.choices || !result.choices[0] || !result.choices[0].message || !result.choices[0].message.content) {
      console.error('Invalid response structure from DeepSeek API:', result);
      throw new Error('Invalid response structure from DeepSeek API');
    }

    const content = result.choices[0].message.content;

    try {
      const parsedData = JSON.parse(content);
      if (typeof parsedData === 'object' && parsedData !== null) {
        return {
          price: typeof parsedData.price === 'number' ? parsedData.price : null,
          title: typeof parsedData.title === 'string' ? parsedData.title : '',
          size: typeof parsedData.size === 'string' ? parsedData.size : '',
          color: typeof parsedData.color === 'string' ? parsedData.color : '',
        };
      } else {
        console.error('Parsed data from DeepSeek is not a valid object:', parsedData);
        throw new Error('Parsed data from DeepSeek is not a valid object');
      }
    } catch (parseError) {
      console.error('Error parsing JSON response from DeepSeek:', parseError, 'Raw content:', content);
      return { price: null, title: '', size: '', color: '' }; // Fallback on parse error
    }
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    return { price: null, title: '', size: '', color: '' }; // Fallback on API error
  }
}
