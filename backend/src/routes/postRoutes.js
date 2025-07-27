import express from "express";
import cloudinary from "../lib/cloudConfig.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/", authMiddleware, async (req, res) =>{
    try {
        const { title, caption, image, genres } = req.body;
        if(!title || !caption || !image){
            return res.status(400).json({message: "All fields are required."});
        } 
        const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "Page-mates",
    });
        const imageUrl = uploadResponse.secure_url;
        const newPost = new Post({
            title,
            caption,
            image: imageUrl,
            genres,
            user: req.user._id,
        });

        await newPost.save();

        res.status(201).json(newPost);

    } catch (error) {
        console.log("error in creation of post", error);
    }
})

router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username profileImage');

    const totalPosts = await Post.countDocuments();

    res.status(200).json({
      posts,
      currentPage: page,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit)
    });
  } catch (error) {
    console.error("Error getting the posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.get('/following', authMiddleware, async( req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalPosts = await Post.countDocuments({
      user: { $in: user.followings },
    });

    const posts = await Post.find({ user: { $in: user.followings } })
      .populate("user", "username profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalPosts / limit);
    res.json({ posts, totalPages });
    
  } catch (err) {
    console.error("Error getting following posts:", err);
    res.status(500).json({ message: "Failed to fetch following posts" });
  }
})

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({ message: "Post not found"});
        }

        if(post.user.toString() != req.user._id.toString()){
            return res.status(401).json({ message: "Unthorized access"});
        }

        if(post.image && post.image.includes("cloudinary")){
            try {
                const publicId = post.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (deleteErr) {
                console.log("Error deleting image from cloud", deleteErr);
            }
        }
        await post.deleteOne();
        
        res.json({ messgae: "Deleted successfully!!"});
    } catch (error) {
        console.log("Error in deleting the book", error);
        res.status(500).json({ message: "Internal server error"});
    }
});

router.get('/user', authMiddleware, async (req, res) => {
    try {
        const posts = await Post.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate("user", "username profileImage"); // only select these fields

        res.json(posts);
    } catch (error) {
        console.log("Error getting the posts", error);
        res.status(500).json({ message: "Internal server Error" });
    }
});

router.get('/user/:userId/posts', async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("user", "username profileImage");

    res.json(posts);
  } catch (error) {
    console.log("Error getting the user's posts", error);
    res.status(500).json({ message: "Internal server Error" });
  }
});


router.post("/like/:postId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;

    const post = await Post.findById(postId);
    const user = await User.findById(userId);

    if (!post || !user)
      return res.status(404).json({ message: "Post or User not found" });

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes.pull(userId); 
      user.likedPosts.pull(postId); 
    } else {
      post.likes.push(userId); 
      user.likedPosts.push(postId); 
    }

    await post.save();
    await user.save();

    res.status(200).json({ message: alreadyLiked ? "Unliked" : "Liked" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



export default router;