import express from "express";
import User from "../models/User.js";

const router = express.Router();


router.get("/followers/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    // console.log("Followers API hit with ID:", req.params.id);
    const user = await User.findById(userId)
      .populate("followers", "_id username profileImage")
      .exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ followers: user.followers });
  } catch (err) {
    console.error("Error fetching followers:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
