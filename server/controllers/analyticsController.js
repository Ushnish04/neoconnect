import Case from '../models/Case.js';

export const getCasesByDepartment = async (req, res, next) => {
  try {
    const data = await Case.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getCasesByStatus = async (req, res, next) => {
  try {
    const data = await Case.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getCasesByCategory = async (req, res, next) => {
  try {
    const data = await Case.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getHotspots = async (req, res, next) => {
  try {
    const data = await Case.aggregate([
      { $group: { _id: { department: '$department', category: '$category' }, count: { $sum: 1 } } },
      { $match: { count: { $gte: 5 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, hotspots: data });
  } catch (error) {
    next(error);
  }
};