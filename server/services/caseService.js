import Case from '../models/Case.js';
import generateTrackingId from '../utils/generateTrackingId.js';

export const createCase = async (data, userId, isAnonymous) => {
  const trackingId = await generateTrackingId();
  const caseData = {
    ...data,
    trackingId,
    submittedBy: isAnonymous ? null : userId,
    anonymous: isAnonymous,
  };
  return await Case.create(caseData);
};

export const getAllCases = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const cases = await Case.find()
    .populate('submittedBy', 'name department')
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Case.countDocuments();
  return { cases, total, page, pages: Math.ceil(total / limit) };
};

export const getCaseById = async (id) => {
  return await Case.findById(id)
    .populate('submittedBy', 'name department')
    .populate('assignedTo', 'name email')
    .populate('notes.addedBy', 'name role');
};

export const assignCase = async (caseId, managerId) => {
  return await Case.findByIdAndUpdate(
    caseId,
    { assignedTo: managerId, status: 'Assigned', lastResponseAt: Date.now() },
    { new: true }
  );
};

export const updateCaseStatus = async (caseId, status, userId) => {
  return await Case.findByIdAndUpdate(
    caseId,
    { status, lastResponseAt: Date.now() },
    { new: true }
  );
};

export const addNote = async (caseId, text, userId) => {
  const caseDoc = await Case.findById(caseId);
  caseDoc.notes.push({ text, addedBy: userId });
  caseDoc.lastResponseAt = Date.now();
  return await caseDoc.save();
};

export const getMyCases = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const cases = await Case.find({ submittedBy: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Case.countDocuments({ submittedBy: userId });
  return { cases, total, page, pages: Math.ceil(total / limit) };
};

export const getAssignedCases = async (managerId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const cases = await Case.find({ assignedTo: managerId })
    .populate('submittedBy', 'name department')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Case.countDocuments({ assignedTo: managerId });
  return { cases, total, page, pages: Math.ceil(total / limit) };
};