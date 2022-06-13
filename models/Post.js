const { model, Schema } = require("mongoose");

const postSchema = new Schema({
  body: String,
  username: String,
  createdAt: String,
  categories: [String],
  pictures: [
    {
      url: String,
      public_id: String,
    },
  ],
  comments: [
    {
      body: String,
      createdAt: String,
      author: {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    },
  ],
  answers: [
    {
      body: String,
      createdAt: String,
      author: {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    },
  ],
  votes: [
    {
      username: String,
      createdAt: String,
    },
  ],
  devotes: [
    {
      username: String,
      createdAt: String,
    },
  ],
  author: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  points: [
    {
      username: String,
      createdAt: String,
      point: Number,
    },
  ],
});

module.exports = model("Post", postSchema);
