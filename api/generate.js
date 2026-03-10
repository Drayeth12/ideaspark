export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { hobby, workplace, skill } = req.body;

  // Random focus so same input gives different ideas every time
  const angles = [
    "Focus on a GenLayer contract that verifies or fact-checks real world information.",
    "Focus on a GenLayer contract that resolves disputes between two people automatically.",
    "Focus on a GenLayer contract that rewards users based on their actions or contributions.",
    "Focus on a GenLayer contract that makes predictions about real world events.",
    "Focus on a GenLayer contract that rates, ranks or scores something automatically.",
    "Focus on a GenLayer contract that detects fake or misleading content.",
  ];
  const angle = angles[Math.floor(Math.random() * angles.length)];

  const context = [];
  if (hobby)     context.push(`hobby: ${hobby}`);
  if (workplace) context.push(`industry: ${workplace}`);

  const skillGuide =
    skill === 'Beginner'     ? 'The idea must be very simple — just 1 contract method, no complex logic, something a total beginner can build in one day.' :
    skill === 'Developer'    ? 'The idea can be technical with multiple contract methods and real data sources.' :
                               'The idea should be moderately complex — clear use case, simple contract structure.';

  const prompt = `You are a GenLayer project idea generator. GenLayer is a blockchain where Intelligent Contracts use built-in AI to make smart decisions — like verifying facts, resolving disputes, scoring content, or rewarding users automatically.

Person's profile: ${context.join(', ')}, skill level: ${skill || 'Beginner'}.
${angle}
${skillGuide}

Generate exactly 3 GenLayer Intelligent Contract project ideas tailored to this person's background.
Each idea must:
- Be directly related to their hobby or industry
- Use GenLayer's AI feature (gl.exec_prompt) in a clear simple way
- Feel fun and personal, not generic or corporate
- Be something real people would actually use

Return ONLY valid JSON, no markdown:
{
  "ideas": [
    {
      "title": "Short catchy name",
      "description": "1 simple sentence — what does it do?",
      "contract_feature": "1 sentence — what does gl.exec_prompt() do inside this contract?"
    },
    {
      "title": "Short catchy name",
      "description": "1 simple sentence — what does it do?",
      "contract_feature": "1 sentence — what does gl.exec_prompt() do inside this contract?"
    },
    {
      "title": "Short catchy name",
      "description": "1 simple sentence — what does it do?",
      "contract_feature": "1 sentence — what does gl.exec_prompt() do inside this contract?"
    }
  ]
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data   = await response.json();
    const raw    = data.content.map(i => i.text || '').join('');
    const clean  = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    res.status(200).json(parsed);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate ideas' });
  }
}
