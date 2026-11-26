import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/ai/status', (_req, res) => {
    const client = getGeminiClient();
    res.json({
      geminiAvailable: Boolean(client),
      model: 'gemini-4-hydrogen',
      mode: client ? 'gemini' : 'mock',
    });
  });

  app.post('/api/ai/generate', async (req, res) => {
    const client = getGeminiClient();
    if (!client) {
      res.status(200).json({
        mode: 'unconfigured',
        message: 'Chưa cấu hình GEMINI_API_KEY trên máy chủ.',
      });
      return;
    }

    const { prompt, systemInstruction } = req.body as {
      prompt?: string;
      systemInstruction?: string;
    };

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({ error: 'Thiếu nội dung yêu cầu (prompt).' });
      return;
    }

    try {
      const response = await client.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt.trim(),
        config: systemInstruction
          ? { systemInstruction: systemInstruction.trim() }
          : undefined,
      });

      const text = (response.text ?? '').trim();
      if (!text) {
        res.status(502).json({
          error: 'Gemini AI trả về nội dung trống. Vui lòng thử lại.',
        });
        return;
      }

      res.json({
        mode: 'gemini',
        model: 'gemini-4-hydrogen',
        text,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Lỗi kết nối Gemini API.';
      res.status(502).json({
        error: `Không thể gọi Gemini AI: ${message}`,
      });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req, res) => {
      const indexHtml = path.join(distDir, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build output not found. Run npm run build.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Connected Classroom server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
