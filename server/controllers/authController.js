import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });
const generateRefreshToken = (id) => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, error: 'User already exists' });
    const user = await User.create({ name, email, password, role, department });
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    res.cookie('token', token, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(201).json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department }});
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    res.cookie('token', token, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department }});
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
  res.json({ success: true, message: 'Logged out' });
};

export const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ success: false, error: 'No refresh token' });
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const token = generateToken(decoded.id);
    res.cookie('token', token, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) { next(error); }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, user });
  } catch (error) { next(error); }
};

export const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) { next(error); }
};