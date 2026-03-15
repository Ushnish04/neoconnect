import Case from '../models/Case.js';
import User from '../models/User.js';
import generateTrackingId from '../utils/generateTrackingId.js';
import { io } from '../server.js';

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
  const manager = await User.findById(managerId);
  if (!manager) {
    throw Object.assign(new Error('User not found'), { status: 400 });
  }
  if (manager.role !== 'case_manager') {
    throw Object.assign(new Error('User is not a Case Manager'), { status: 400 });
  }

  const updated = await Case.findByIdAndUpdate(
    caseId,
    { assignedTo: managerId, status: 'Assigned', lastResponseAt: Date.now() },
    { new: true }
  ).populate('assignedTo', 'name email');

  if (updated?.assignedTo?._id) {
    io.to(updated.assignedTo._id.toString()).emit('notification', {
      type: 'assigned',
      message: `You have been assigned case ${updated.trackingId}`,
      caseId: updated._id,
      trackingId: updated.trackingId,
      createdAt: new Date(),
    });
  }

  return updated;
};

export const updateCaseStatus = async (caseId, status, userId) => {
  const updated = await Case.findByIdAndUpdate(
    caseId,
    { status, lastResponseAt: Date.now() },
    { new: true }
  ).populate('submittedBy', 'name department');

  if (updated?.submittedBy?._id) {
    io.to(updated.submittedBy._id.toString()).emit('notification', {
      type: 'status_update',
      message: `Your case ${updated.trackingId} is now ${status}`,
      caseId: updated._id,
      trackingId: updated.trackingId,
      createdAt: new Date(),
    });
  }

  return updated;
};

export const addNote = async (caseId, text, userId) => {
  const caseDoc = await Case.findById(caseId);
  caseDoc.notes.push({ text, addedBy: userId });
  caseDoc.lastResponseAt = Date.now();
  return await caseDoc.save();
};

export const escalateCase = async (caseId) => {
  const updated = await Case.findByIdAndUpdate(
    caseId,
    { status: 'Escalated' },
    { new: true }
  ).populate('assignedTo', 'name email');

  if (updated?.assignedTo?._id) {
    io.to(updated.assignedTo._id.toString()).emit('notification', {
      type: 'escalated',
      message: `Case ${updated.trackingId} has been escalated — no response in 7 days`,
      caseId: updated._id,
      trackingId: updated.trackingId,
      createdAt: new Date(),
    });
  }

  return updated;
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