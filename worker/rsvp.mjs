const events = { cremation: 'Cremation', celebration: 'Celebration' };

export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname !== '/rsvp') return new Response(null, { status: 404 });

    const origin = request.headers.get('Origin');
    if (!origin || origin !== env.PAGES_ORIGIN) return new Response(null, { status: 403 });

    const headers = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
      'Cache-Control': 'no-store',
    };
    const respond = (status, message) => Response.json({ message }, { status, headers });

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return respond(405, 'Method not allowed.');
    if (request.headers.get('Content-Type') !== 'application/json') {
      return respond(415, 'Expected JSON.');
    }
    if (!env.RESEND_API_KEY || !env.RSVP_FROM) return respond(503, 'RSVP is not configured.');

    let body;
    try {
      const reader = request.body?.getReader();
      if (!reader) return respond(400, 'Missing RSVP.');
      const decoder = new TextDecoder();
      let size = 0;
      let input = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 2048) {
          await reader.cancel();
          return respond(413, 'RSVP is too large.');
        }
        input += decoder.decode(value, { stream: true });
      }
      body = JSON.parse(input + decoder.decode());
    } catch {
      return respond(400, 'Invalid RSVP.');
    }

    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    if (!name || name.length > 100 || /[\r\n]/.test(name)) return respond(400, 'Enter a name.');
    const attendance = body?.attendance;
    if (!attendance || typeof attendance !== 'object' || Array.isArray(attendance)) {
      return respond(400, 'Select at least one event.');
    }

    const selections = Object.entries(attendance);
    if (!selections.length || selections.some(([key, count]) =>
      !Object.hasOwn(events, key) || !Number.isSafeInteger(count) || count < 1)) {
      return respond(400, 'Enter a valid headcount for each selected event.');
    }

    const lines = selections.map(([key, count]) => events[key] + ': ' + count);
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + env.RESEND_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.RSVP_FROM,
          to: ['p@ulcozens.com'],
          subject: 'RSVP for Tony’s cremation and celebration',
          text: ['Name: ' + name, '', ...lines].join('\n'),
        }),
      });
      if (!response.ok) return respond(502, 'Email delivery failed.');
    } catch {
      return respond(502, 'Email delivery failed.');
    }
    return respond(200, 'RSVP received.');
  },
};
