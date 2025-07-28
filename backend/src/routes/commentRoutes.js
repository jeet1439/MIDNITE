import express from 'express';
import Comment from '../models/comments.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import mongoose from 'mongoose';
const router = express.Router();


router.get('/:postId', authMiddleware, async (req, res) => {
  try {
    const postObjectId = new mongoose.Types.ObjectId(req.params.postId);

    const comments = await Comment.find({ postId: postObjectId })
      .populate('userId', 'username profileImage')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    console.error('Failed to fetch comments:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});


router.post('/', authMiddleware, async (req, res) => {
  try {
    const { postId, text } = req.body;

    if (!postId || !text || !req.user?.id) {
      return res.status(400).json({ error: 'Missing field' });
    }

    const newComment = new Comment({
      postId,
      userId: req.user.id,
      text, 
    });

    await newComment.save();

    const populatedComment = await Comment.findById(newComment._id)
      .populate('userId', 'username profileImage');
    res.status(201).json(populatedComment);
  } catch (err) {
    console.error(' Backend Error:', err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});




router.delete('/:commentId', authMiddleware, async (req, res) => {
    try {
    const comment = await Comment.findById(req.params.commentId);
    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await Comment.findByIdAndDelete(req.params.commentId);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});


export default router;
