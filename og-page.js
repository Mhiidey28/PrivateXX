
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    const slug = event.path.split('/').pop() || (event.queryStringParameters && event.queryStringParameters.slug);
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!slug) return { statusCode: 400, body: 'Missing slug' };

    const url = `${SUPABASE_URL}/rest/v1/videos?slug=eq.${encodeURIComponent(slug)}&select=*`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    const data = await res.json();
    if (!data || data.length === 0) {
      return { statusCode: 404, body: 'Not found' };
    }
    const video = data[0];
    const title = (video.title || 'Video').replace(/"/g, '&quot;');
    const thumb = (video.thumbnail_url || '/assets/coming-soon.png');
    const host = event.headers['x-forwarded-host'] || event.headers.host || '';
    const pageUrl = `https://${host}/v/${slug}`;
    const body = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<meta property="og:title" content="${title}" />
<meta property="og:description" content="Watch on PRIVATE" />
<meta property="og:image" content="${thumb}" />
<meta property="og:type" content="video.other" />
<meta property="og:url" content="${pageUrl}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:image" content="${thumb}" />
</head><body><script>window.location.href="/video.html?slug=${slug}";</script></body></html>`;
    return { statusCode: 200, headers: { 'Content-Type': 'text/html' }, body };
  } catch (err) {
    return { statusCode: 500, body: 'Server error: ' + err.message };
  }
};
