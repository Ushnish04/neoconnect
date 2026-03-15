import Poll from '../models/Poll.js';
import Vote from '../models/Vote.js';

export const createPoll = async (question, options, userId, expiresAt) => {
  const formattedOptions = options.map(text => ({ text, votes: 0 }));
  return await Poll.create({ question, options: formattedOptions, createdBy: userId, expiresAt });
};

export const getPolls = async () => {
  return await Poll.find().populate('createdBy', 'name').sort({ createdAt: -1 });
};

export const voteOnPoll = async (pollId, optionIndex, userId) => {
  const existingVote = await Vote.findOne({ user: userId, poll: pollId });
  if (existingVote) throw new Error('You have already voted on this poll');
  const poll = await Poll.findById(pollId);
  if (!poll) throw new Error('Poll not found');
  if (!poll.isActive) throw new Error('Poll is no longer active');
  poll.options[optionIndex].votes += 1;
  await poll.save();
  await Vote.create({ user: userId, poll: pollId, option: optionIndex });
  return poll;
};