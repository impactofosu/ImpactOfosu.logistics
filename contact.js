const { parsePayload, validatePayload, sendContactEmail } = require('../contact-email');

module.exports = async function contactHandler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, message: 'Method not allowed.' }));
    return;
  }

  try {
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    const rawBody = Buffer.concat(chunks).toString('utf8');
    let payload = {};

    try {
      payload = rawBody ? JSON.parse(rawBody) : {};
    } catch (error) {
      const searchParams = new URLSearchParams(rawBody);
      payload = Object.fromEntries(searchParams.entries());
    }

    const parsedData = parsePayload(payload);
    const validation = validatePayload(parsedData);

    if (!validation.ok) {
      res.statusCode = validation.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, message: validation.message }));
      return;
    }

    const emailResult = await sendContactEmail(validation.data);

    res.statusCode = emailResult.ok ? 200 : emailResult.status || 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: emailResult.ok, message: emailResult.message }));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, message: 'Unable to process your request right now.' }));
  }
};
