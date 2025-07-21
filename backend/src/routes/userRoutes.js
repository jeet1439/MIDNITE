import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import cloudinary from "../lib/cloudConfig.js";

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
    return res.status(400).json({ message: "A valid image string is required" });
  }

  try {
    // Upload base64 image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(newImage, {
      folder: "ProfileImages",
    });

    const imageUrl = uploadResponse.secure_url;

    const user = await User.findByIdAndUpdate(
       req.user.id,
       { 
        $push: { 
          profileImage: { 
            $each: [imageUrl], 
            $position: 0 
          } 
        } 
      },
      { new: true }
    );

    res.status(200).json({ message: "Profile image updated", user });
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

//route for following a user: 

router.post("/follow/:id", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.id;

    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = currentUser.followings.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      currentUser.followings.pull(targetUserId);
      targetUser.followers.pull(currentUserId);
    } else {
      // Follow
      currentUser.followings.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({ followed: !isFollowing });
  } catch (err) {
    console.error("Follow error", err);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
