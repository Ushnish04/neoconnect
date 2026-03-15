import * as aiService from '../services/aiService.js';
import Case from '../models/Case.js';

export const summarizeCase = async (req, res, next) => {
  try {
    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) return res.status(404).json({ success: false, error: 'Case not found' });

    if (caseDoc.aiSummary && caseDoc.summarizedAt) {
      const lastNote = caseDoc.notes[caseDoc.notes.length - 1];
      const noteAfterSummary = lastNote && lastNote.createdAt > caseDoc.summarizedAt;
      if (!noteAfterSummary) {
        return res.json({ success: true, summary: caseDoc.aiSummary, cached: true });
      }
    }

    const summary = await aiService.summarizeCase(caseDoc);
    caseDoc.aiSummary = summary;
    caseDoc.summarizedAt = new Date();
    await caseDoc.save();

    res.json({ success: true, summary, cached: false });
  } catch (error) {
    next(error);
  }
};

export const getTrendInsight = async (req, res, next) => {
  try {
    const { analyticsData } = req.body;
    const insight = await aiService.generateTrendInsight(analyticsData);
    res.json({ success: true, insight });
  } catch (error) {
    next(error);
  }
};

export const suggestTag = async (req, res, next) => {
  try {
    const { description } = req.body;
    const suggestion = await aiService.suggestCategoryAndSeverity(description);
    res.json({ success: true, suggestion });
  } catch (error) {
    next(error);
  }
};