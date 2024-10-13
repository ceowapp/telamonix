import puppeteer from 'puppeteer';

export async function POST(req: Request): Promise<Response> {
  try {
    const { url } = await req.json();
    
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigate to the page and wait for network to be idle
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    
    // Try to click any "Accept Cookies" button
    try {
      await page.click('button:contains("Accept"), button:contains("Accept Cookies")', { timeout: 5000 });
    } catch (e) {
      // If no button found or clicking fails, continue
    }
    
    // Scroll to bottom of page to trigger any lazy-loading
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Wait a bit for any dynamically loaded content
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const content = await page.evaluate(() => {
      // Remove unwanted elements
      const elementsToRemove = document.querySelectorAll('script, style, noscript, iframe, img, svg, canvas, audio, video, [aria-hidden="true"], .hidden, meta, link, br, hr');
      elementsToRemove.forEach(el => el.remove());
      
      // Extract text from remaining elements
      const extractText = (element) => {
        let text = '';
        element.childNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent.trim() + ' ';
          } else if (node.nodeType === Node.ELEMENT_NODE && ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'TD', 'TH', 'DIV', 'SPAN', 'A'].includes(node.tagName)) {
            text += extractText(node) + ' ';
          }
        });
        return text.trim();
      };
      
      // Try to find a main content container
      const mainContent = document.querySelector('main, #main, .main, article, .article, .content, #content');
      const textContent = mainContent ? extractText(mainContent) : extractText(document.body);
      
      return textContent
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .replace(/[^\S\n]+/g, ' ')
        .trim();
    });
    
    await browser.close();
    
    if (content.length < 50) {  // Adjust this threshold as needed
      throw new Error("Insufficient content extracted");
    }
    
    return new Response(content, { 
      status: 200,
      headers: { "Content-Type": "text/plain" }
    });
  } catch (error: any) {
    let status = 500;
    let errorMessage = "An unexpected error occurred";
    let errorCode = "unknown_error";
    let errorType = "internal_server_error";
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage, 
      code: errorCode,
      type: errorType
    }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}