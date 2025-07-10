import mongoose from "mongoose";

const userActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  likedGenres: [String],
  ratedPosts: [{
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    rating: Number
  }],
  viewedPosts: [{
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    timestamp: Date
  }]
});


const UserAct = mongoose.model("UserAct", userActivitySchema);

export default UserAct;