import * as pollService from '../services/pollService.js';

export const createPoll = async (req, res, next) => {
  try {
    const { question, options, expiresAt } = req.body;
    const poll = await pollService.createPoll(question, options, req.user._id, expiresAt);
    res.status(201).json({ success: true, poll });
  } catch (error) {
    next(error);
  }
};

export const getPolls = async (req, res, next) => {
  try {
    const polls = await pollService.getPolls();
    res.json({ success: true, polls });
  } catch (error) {
    next(error);
  }
};

export const vote = async (req, res, next) => {
  try {
    const { optionIndex } = req.body;
    const poll = await pollService.voteOnPoll(req.params.id, optionIndex, req.user._id);
    res.json({ success: true, poll });
  } catch (error) {
    next(error);
  }
};