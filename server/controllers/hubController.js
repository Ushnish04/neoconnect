import HubContent from '../models/HubContent.js';

export const createHubContent = async (req, res, next) => {
  try {
    const content = await HubContent.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, content });
  } catch (error) {
    next(error);
  }
};

export const getHubContent = async (req, res, next) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    const content = await HubContent.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, content });
  } catch (error) {
    next(error);
  }
};

export const deleteHubContent = async (req, res, next) => {
  try {
    await HubContent.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    next(error);
  }
};