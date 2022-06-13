const { model, Schema } = require("mongoose");

const userSchema = new Schema({
  username: String,
  displayName: String,
  password: String,
  createdAt: String,
  email: String,
  avatar: {
    url: {
      type: String,
      default: "",
    },
    public_id: {
      type: String,
      default: "",
    },
  },
  banner: {
    url: {
      type: String,
      default: "",
    },
    public_id: {
      type: String,
      default: "",
    },
  },
  role: { type: String, default: "student" },
  followedPosts: [
    {
      type: Schema.Types.ObjectId,
      ref: "posts",
    },
  ],
  followings: [{ type: Schema.Types.ObjectId, ref: "users" }],
  followers: [{ type: Schema.Types.ObjectId, ref: "users" }],
  confirmed: { type: Boolean, default: false },
});

module.exports = model("User", userSchema);
