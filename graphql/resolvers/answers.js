const { UserInputError, AuthenticationError } = require("apollo-server");
const ObjectId = require("mongodb").ObjectId;

const checkAuth = require("../../util/checkAuth");
const Post = require("../../models/Post");
const User = require("../../models/User");

module.exports = {
  Answer: {
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
    createAnswer: async (_, { postId, body }, context) => {
      const { id } = checkAuth(context);
      if (body.trim() === "") {
        throw new UserInputError("Câu trả lời trống", {
          errors: {
            body: "Answer body không được để trống",
          },
        });
      }

      const post = await Post.findById(postId);
      if (post) {
        post.answers.unshift({
          //unshift là thêm vào đầu mảng
          body,
          createdAt: new Date().toISOString(),
          author: id,
        });

        await post.save();
        return post;
      } else throw new UserInputError("Không tìm thấy bài viết");
    },

    async deleteAnswer(_, { postId, answerId }, context) {
      const { id } = checkAuth(context);
      const userId = ObjectId(id);
      const post = await Post.findById(postId);
      if (post) {
        const answerIndex = post.answers.findIndex((answer) => {
          return answer.id === answerId;
        });

        const user = await User.findById(post.answers[answerIndex].author);

        if (user._id.toString() === userId.toString()) {
          post.answers.splice(answerIndex, 1);
          await post.save();
          return post;
        } else {
          throw new AuthenticationError(
            "Bạn không có quyền xóa câu trả lời này"
          );
        }
      } else {
        throw new UserInputError("Không tìm thấy bài viết");
      }
    },
  },
};
