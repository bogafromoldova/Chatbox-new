module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    return res.status(500).json({ error: { message: 'Lipsește variabila OPENROUTER_API_KEY în Vercel.' } });
  }

  const body = req.body || {};
  const messages = body.messages;
  const model = typeof body.model === 'string' && body.model.trim() ? body.model.trim() : 'meta-llama/llama-3.3-70b-instruct:free';

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: { message: 'Lipsesc mesajele.' } });
  }

  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model, messages })
    });

    const text = await r.text();
    let data;
    try { data = JSON.parse(text); }
    catch { data = { error: { message: 'Răspuns neașteptat de la OpenRouter (' + r.status + ').' } }; }

    return res.status(r.ok ? 200 : r.status).json(data);
  } catch (e) {
    return res.status(502).json({ error: { message: 'Nu m-am putut conecta la OpenRouter.' } });
  }
};
