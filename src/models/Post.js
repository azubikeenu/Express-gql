import { Schema, model } from 'mongoose';

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    featuredImage: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const Post = new model('Post', postSchema);

export default Post;
