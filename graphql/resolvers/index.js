const { GraphQLUpload } = require("graphql-upload");

const postsResolvers = require("./posts");
const usersResolvers = require("./users");
const commentsResolvers = require("./comments");
const answersResolvers = require("./answers");
const uploadResolvers = require("./upload");

module.exports = {
  Query: {
    ...postsResolvers.Query,
    ...usersResolvers.Query,
  },
  Post: {
    ...postsResolvers.Post,
  },
  User: {
    ...usersResolvers.User,
  },
  Comment: {
    ...commentsResolvers.Comment,
  },
  Answer: { ...answersResolvers.Answer },
  Upload: GraphQLUpload,
  Mutation: {
    ...usersResolvers.Mutation,
    ...postsResolvers.Mutation,
    ...commentsResolvers.Mutation,
    ...answersResolvers.Mutation,
    ...uploadResolvers.Mutation,
  },
};
