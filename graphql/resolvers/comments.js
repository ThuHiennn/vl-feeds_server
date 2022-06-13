const { UserInputError, AuthenticationError } = require("apollo-server");
const ObjectId = require("mongodb").ObjectId;
const checkAuth = require("../../util/checkAuth");
const User = require("../../models/User");
const Post = require("../../models/Post");

module.exports = {
  Comment: {
    async author(parent, args, context) {
      try {
        const user = await User.findById(parent.author);
        return user;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    createComment: async (_, { postId, body }, context) => {
      const { id } = checkAuth(context);
      if (body.trim() === "") {
        throw new UserInputError("Bình luận trống", {
          errors: {
            body: "Comment body không được để trống",
          },
        });
      }

      const post = await Post.findById(postId);
      if (post) {
        post.comments.unshift({
          //unshift là thêm vào đầu mảng
          body,
          createdAt: new Date().toISOString(),
          author: id,
        });
        await post.save();
        return post;
      } else throw new UserInputError("Không tìm thấy bài viết");
    },

    async deleteComment(_, { postId, commentId }, context) {
      const { id } = checkAuth(context);
      const userId = ObjectId(id);
      const post = await Post.findById(postId);
      if (post) {
        const commentIndex = post.comments.findIndex(
          (comment) => comment.id === commentId
        );

        const user = await User.findById(post.comments[commentIndex].author);

        if (user._id.toString() === userId.toString()) {
          post.comments.splice(commentIndex, 1);
          await post.save();
          return post;
        } else {
          throw new AuthenticationError("Bạn không có quyền xóa bình luận này");
        }
      } else {
        throw new UserInputError("Không tìm thấy bài viết");
      }
    },
  },
};
