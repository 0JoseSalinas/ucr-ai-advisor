const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'ucr_ai_app',
      password: 'adele2025',
      port: 5432,
    });

app.get('/student', (req, res) => {
  res.json({
    name: 'Jose',
    school: 'UCR',
  });
});

app.post('/question', async (req, res) => {
  try {
    const { question } = req.body;

    console.log('POST route hit');
    console.log('Body:', req.body);

    const aiResponse = await openai.responses.create({
      model: 'gpt-4.1-mini',
      input: `
You are UCR AI Advisor, an academic support assistant for UC Riverside students.

Behavior rules:
- Give the student a direct answer first.
- Be practical, encouraging, and organized.
- If details are missing, make a reasonable assumption and say so briefly.
- Only ask 1 follow-up question at the end if it would really improve the answer.
- Prefer short paragraphs or bullet points.
- Avoid sounding overly formal or robotic.
- Keep the answer under 120 words unless the question clearly needs more detail.

Answer this student question:
${question}
`
    });

    console.log('AI RESPONSE OBJECT:', JSON.stringify(aiResponse, null, 2));

    const response = aiResponse.output_text || 'No AI response returned.';

    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        question TEXT,
        response TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    const result = await pool.query(
      'INSERT INTO questions (question, response, created_at) VALUES ($1, $2, NOW()) RETURNING *',
      [question, response]
    );

    console.log('Inserted row:', result.rows[0]);

    res.json({
      message: 'Saved to database ✅',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('POST error:', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
});

app.get('/questions', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM questions ORDER BY id DESC'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('GET /questions error:', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
});

app.get('/debug-columns', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'questions'
      ORDER BY ordinal_position
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('GET /debug-columns error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

setInterval(() => {}, 1000);