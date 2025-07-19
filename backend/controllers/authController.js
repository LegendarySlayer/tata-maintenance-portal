import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/* ---------------------------------------------
  🔐 SIGNUP CONTROLLER
---------------------------------------------- */
export const signup = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ username, role });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // ✅ FIX: Pass the plain password directly to the model.
    // The pre-save hook in your User.js model will handle hashing automatically.
    const newUser = new User({ username, password, role });
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ---------------------------------------------
  🔑 LOGIN CONTROLLER (This part is already correct)
---------------------------------------------- */
export const login = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    let user = await User.findOne({ username, role });

    if (!user) {
      if (
        (username === 'admin' && password === 'admin123' && role === 'manager') ||
        (username === 'user' && password === 'user123' && role === 'user')
      ) {
        // The pre-save hook will also correctly hash passwords for these default users now.
        user = new User({ username, password, role });
        await user.save();
      } else {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Wrong password' });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        username: user.username,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};