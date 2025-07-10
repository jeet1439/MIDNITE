import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
      title:{
        type: String,
        required: true,
      },
      caption: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      image: {
         type: String,
         required: true,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      genres: [String],
      likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }],
      views: {
        type: Number,
        default: 0
      }
}, {timestamps: true});


const Post = mongoose.model("Post", postSchema);

export default Post;