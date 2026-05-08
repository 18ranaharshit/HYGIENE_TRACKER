import { Request, Response } from 'express';
import OpenAI from 'openai';
import { Toilet } from '../models/Toilet';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a sanitation expert. Analyze this public toilet hygiene data and photo if provided.
Return ONLY valid JSON with these fields:
- score: number from 0 to 100
- issues: array of strings describing problems found
- recommendations: array of strings with actionable steps
- riskLevel: one of "low", "medium", "high", "critical"`;

/**
 * @route POST /api/ai/analyze
 * @desc Accept toiletId + optional base64 photo, call OpenAI, return hygiene report
 * @access Protected
 */
export const analyze = async (req: Request, res: Response): Promise<void> => {
  try {
    const { toiletId, photo } = req.body as { toiletId: string; photo?: string };
    const toilet = await Toilet.findById(toiletId);
    if (!toilet) { res.status(404).json({ success: false, message: 'Toilet not found' }); return; }

    const contextText = `Toilet: ${toilet.name}, Address: ${toilet.address}, Type: ${toilet.type}, Amenities: ${toilet.amenities.join(', ')}, Current hygiene score: ${toilet.hygieneScore}`;

    let result: string;

    if (photo) {
      // Vision model when photo is provided
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: `${SYSTEM_PROMPT}\n\nContext: ${contextText}` },
            { type: 'image_url', image_url: { url: photo } },
          ],
        }],
        max_tokens: 800,
      });
      result = response.choices[0]?.message.content ?? '{}';
    } else {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Analyze this toilet facility: ${contextText}` },
        ],
        max_tokens: 600,
      });
      result = response.choices[0]?.message.content ?? '{}';
    }

    // Strip markdown code fences if present
    const clean = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(clean) as { score: number; issues: string[]; recommendations: string[]; riskLevel: string };

    // Update toilet hygiene score
    await Toilet.findByIdAndUpdate(toiletId, { hygieneScore: parsed.score, lastInspected: new Date() });

    res.json({
      success: true,
      data: { ...parsed, toiletId, createdAt: new Date().toISOString() },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'AI analysis failed', error: String(err) });
  }
};

/**
 * @route GET /api/ai/report/:id
 * @desc Get latest AI report for a toilet (returns toilet hygiene score)
 * @access Protected
 */
export const getReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const toilet = await Toilet.findById(req.params['id']);
    if (!toilet) { res.status(404).json({ success: false, message: 'Toilet not found' }); return; }
    res.json({
      success: true,
      data: {
        score: toilet.hygieneScore,
        issues: [],
        recommendations: [],
        riskLevel: toilet.hygieneScore >= 75 ? 'low' : toilet.hygieneScore >= 50 ? 'medium' : 'high',
        toiletId: toilet._id,
        createdAt: toilet.lastInspected ?? toilet.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch report', error: String(err) });
  }
};
