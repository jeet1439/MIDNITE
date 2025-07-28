import express from 'express';
import comments from '../models/comments.js';
import authMiddleware from '../middlewares/authMiddleware.js';
const router = express.Router();

router.get('/:postId', authMiddleware, async (req, res)=>{
    try {
    const comments = await Comment.find({ postId: req.params.postId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
    try {
    const { postId, text } = req.body;
    const newComment = new Comment({
      postId,
      userId: req.user.id, // from auth middleware
      text,
    });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (err) {
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
