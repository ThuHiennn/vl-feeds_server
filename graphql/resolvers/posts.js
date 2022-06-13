const { AuthenticationError } = require("apollo-server");
const ObjectId = require("mongodb").ObjectId;
const cloudinary = require("cloudinary").v2;

const Post = require("../../models/Post");
const User = require("../../models/User");
const checkAuth = require("../../util/checkAuth");

module.exports = {
  Query: {
    async posts(_, { limit, after }) {
      let afterIndex = 0;

      const posts = await Post.find().sort({ createdAt: -1 });
      if (posts.length > 0) {
        if (after) {
          let nodeIndex = posts.findIndex((datum) => datum.id === after);
          if (nodeIndex >= 0) {
            afterIndex = nodeIndex + 1;
          }
        }
        const slicedData = posts.slice(afterIndex, afterIndex + limit);
        const edges = slicedData.map((node) => ({
          node,
          cursor: node.id,
        }));

        let startCursor = null;

        if (edges.length > 0) {
          startCursor = edges[edges.length - 1].node.id;
        }
        let hasNextPage = posts.length > afterIndex + limit;
        return {
          totalCount: posts.length,
          edges,
          pageInfo: {
            startCursor,
            hasNextPage,
          },
        };
      } else {
        return {
          totalCount: 0,
          edges: [],
          pageInfo: {
            startCursor: null,
            hasNextPage: false,
          },
        };
      }
    },
    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId);
        if (post) {
          return post;
        } else {
          throw new Error("Không tìm thấy bài viết");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getUserPosts(parent, { userId }) {
      try {
        const posts = await Post.find({ author: userId }).sort({
          createdAt: -1,
        });
        if (posts) {
          return posts;
        } else {
          throw new Error("Không tìm thấy bài viết");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getFollowedUsersPosts(parent, { userIds }) {
      try {
        const posts = await Post.find({ author: { $in: userIds } }).sort({
          createdAt: -1,
        });
        if (posts) {
          return posts;
        } else {
          throw new Error("Không tìm thấy bài viết");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },

  Post: {
    commentCount: (parent) => parent.comments.length,
    votesCount: (parent) => parent.votes.length,
    devotesCount: (parent) => parent.devotes.length,
    reputationsCount: (parent) => {
      return parent.votes.length - parent.devotes.length;
    },

    async author(parent, args) {
      try {
        const user = await User.findById(parent.author);
        if (user) {
          return user;
        } else {
          return null;
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },

  Mutation: {
    async createPost(_, { body, categories, pictures }, context) {
      const user = checkAuth(context);
      const { id } = user;
      const foundUser = await User.findById(id);
      if (body.trim() === "") {
        throw new Error("Post body không được để trống");
      }
      const newPost = new Post({
        id,
        body,
        categories,
        pictures,
        author: foundUser,
        createdAt: new Date().toISOString(),
      });

      const post = await newPost.save();

      return post;
    },

    async deletePost(_, { postId }, context) {
      const { id } = checkAuth(context);
      const user = await User.findById(id);
      try {
        const post = await Post.findById(postId);
        const postImageIds = post.pictures.map((picture) => picture.public_id);
        const author = await User.findById(post.author);
        if (id === author.id || user.role === "admin") {
          if (postImageIds.length > 0) {
            cloudinary.api.delete_resources(postImageIds, (error) => {
              if (error) {
                throw new Error(error);
              }
            });
          }
          await post.delete();
          return "Xóa bài viết thành công";
        } else {
          throw new AuthenticationError("Bạn không có quyền xóa bài viết này");
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    async votePost(_, { postId }, context) {
      const { username } = checkAuth(context);
      const post = await Post.findById(postId);
      if (post) {
        if (post.votes.length >= 999) {
          throw new Error("Bài viết đã được vote quá 1000 lần");
        }
        if (post.votes.find((vote) => vote.username === username)) {
          //Post already voted, remove vote
          post.votes = post.votes.filter((vote) => vote.username !== username);
          await post.save();
        } else {
          //Post already devoted, remove devote
          post.devotes = post.devotes.filter(
            (devote) => devote.username !== username
          );
          //Not voted, vote post
          post.votes.push({
            username,
            createdAt: new Date().toISOString(),
          });
        }

        await post.save();
        return post;
      } else throw new UserInputError("Không tìm thấy bài viết");
    },

    async devotePost(_, { postId }, context) {
      const { username } = checkAuth(context);
      const post = await Post.findById(postId);
      if (post.devotes.length >= 999) {
        throw new Error("Bài viết đã được downvote quá 1000 lần");
      }
      if (post) {
        if (post.devotes.find((devote) => devote.username === username)) {
          //Post already devoted, remove devote
          post.devotes = post.devotes.filter(
            (devote) => devote.username !== username
          );
          await post.save();
        } else {
          //Post already voted, remove vote
          post.votes = post.votes.filter((vote) => vote.username !== username);

          //Not devoted, devote post
          post.devotes.push({
            username,
            createdAt: new Date().toISOString(),
          });
        }

        await post.save();
        return post;
      } else throw new UserInputError("Không tìm thấy bài viết");
    },

    async followPost(_, { postId }, context) {
      const { id } = checkAuth(context);
      const user = await User.findById(id);
      const post = await Post.findById(postId);
      const objectPostId = ObjectId(postId);

      if (post) {
        if (
          user.followedPosts.find(
            (post) => post.toString() === objectPostId.toString()
          )
        ) {
          //Post already followed, remove follow
          user.followedPosts = user.followedPosts.filter((follow) => {
            return follow.toString() !== objectPostId.toString();
          });
          await user.save();
        } else {
          //Not followed, follow post
          user.followedPosts.unshift(objectPostId);

          await user.save();
        }
      }

      return user;
    },

    async pointPost(_, { postId, point }, context) {
      const { id } = checkAuth(context);
      const user = await User.findById(id);
      const post = await Post.findById(postId);
      if (post) {
        if (post.points.find((point) => point.username === user.username)) {
          //Post already point, add new point
          const found = post.points.find(
            (point) => point.username === user.username
          );
          found.point = point;
          found.createdAt = new Date().toISOString();
          await post.save();
        } else {
          //Not point, point post
          post.points.push({
            username: user.username,
            createdAt: new Date().toISOString(),
            point,
          });
          await post.save();
        }
        return post;
      } else throw new UserInputError("Không tìm thấy bài viết");
    },
  },
};
