import * as caseService from '../services/caseService.js';

export const submitCase = async (req, res, next) => {
  try {
    const { category, department, location, severity, description, anonymous } = req.body;
    const attachments = req.files ? req.files.map(f => f.path) : [];
    const newCase = await caseService.createCase(
      { category, department, location, severity, description, attachments },
      req.user._id,
      anonymous === 'true' || anonymous === true
    );
    res.status(201).json({ success: true, case: newCase });
  } catch (error) {
    next(error);
  }
};

export const getCases = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await caseService.getAllCases(Number(page) || 1, Number(limit) || 20);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getCase = async (req, res, next) => {
  try {
    const caseDoc = await caseService.getCaseById(req.params.id);
    if (!caseDoc) return res.status(404).json({ success: false, error: 'Case not found' });
    res.json({ success: true, case: caseDoc });
  } catch (error) {
    next(error);
  }
};

export const assignCase = async (req, res, next) => {
  try {
    const { caseId, managerId } = req.body;
    const updated = await caseService.assignCase(caseId, managerId);
    res.json({ success: true, case: updated });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const updated = await caseService.updateCaseStatus(req.params.id, status, req.user._id);
    res.json({ success: true, case: updated });
  } catch (error) {
    next(error);
  }
};

export const addNote = async (req, res, next) => {
  try {
    const { text } = req.body;
    const updated = await caseService.addNote(req.params.id, text, req.user._id);
    res.json({ success: true, case: updated });
  } catch (error) {
    next(error);
  }
};

export const getMyCases = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await caseService.getMyCases(req.user._id, Number(page) || 1, Number(limit) || 20);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getAssignedCases = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await caseService.getAssignedCases(req.user._id, Number(page) || 1, Number(limit) || 20);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};