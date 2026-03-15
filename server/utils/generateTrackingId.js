import Case from '../models/Case.js';

const generateTrackingId = async () => {
  const year = new Date().getFullYear();
  const count = await Case.countDocuments({
    createdAt: { $gte: new Date(`${year}-01-01`) }
  });
  const number = String(count + 1).padStart(3, '0');
  return `NEO-${year}-${number}`;
};

export default generateTrackingId;