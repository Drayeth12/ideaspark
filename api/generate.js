export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { hobby, workplace, skill } = req.body;

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
    skill === 'Beginner'  ? 'The idea must be very simple — just 1 contract method, buildable in one day by a total beginner.' :
    skill === 'Developer' ? 'The idea can be technical with multiple contract methods and real data sources.' :
                            'The idea should be moderately complex with a clear use case.';

  const prompt = `You are a GenLayer project idea generator. GenLayer is a blockchain where Intelligent Contracts use built-in AI to make smart decisions — like verifying facts, resolving disputes, scoring content, or rewarding users automatically.

Person's profile: ${context.join(', ')}, skill level: ${skill || 'Beginner'}.
${angle}
${skillGuide}

Generate exactly 3 GenLayer Intelligent Contract project ideas tailored to this person's background.
Each idea must be directly related to their hobby or industry, use GenLayer's AI feature, and feel fun and personal.

Return ONLY valid JSON, no markdown:
{
  "ideas": [
    {
      "title": "Short catchy name",
      "description": "1 simple sentence — what does it do?",
      "contract_feature": "1 sentence — what does the AI inside the contract actually do?"
    },
    {
      "title": "Short catchy name",
      "description": "1 simple sentence — what does it do?",
      "contract_feature": "1 sentence — what does the AI inside the contract actually do?"
    },
    {
      "title": "Short catchy name",
      "description": "1 simple sentence — what does it do?",
      "contract_feature": "1 sentence — what does the AI inside the contract actually do?"
    }
  ]
}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data   = await response.json();
    const raw    = data.choices[0].message.content;
    const clean  = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    res.status(200).json(parsed);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate ideas' });
  }
}
