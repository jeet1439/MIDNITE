import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import authMiddleware from "../middlewares/authMiddleware.js";


const router = express.Router();

router.put("/update-username", authMiddleware, async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  try {
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username },
      { new: true }
    );
    res.status(200).json({ message: "Username updated", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


router.put("/update-profile", authMiddleware, async (req, res) => {
  const { newImage } = req.body;

  if (!newImage || typeof newImage !== "string") {
    return res.status(400).json({ message: "A valid image URL string is required" });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { profileImage: newImage } },
      { new: true }
    );

    res.status(200).json({ message: "Profile image added", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


router.put("/update-email", authMiddleware, async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { email },
      { new: true }
    );
    res.status(200).json({ message: "Email updated", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


router.put("/update-password", authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Both old and new passwords are required" });
  }

  try {
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


export default router;
