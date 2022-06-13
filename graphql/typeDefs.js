const { gql } = require("apollo-server");

module.exports = gql`
  type Post {
    id: ID!
    body: String!
    createdAt: String!
    username: String!
    author: User
    comments: [Comment]!
    commentCount: Int!
    answers: [Answer]!
    votes: [Vote]!
    votesCount: Int!
    devotes: [Devote]!
    devotesCount: Int!
    reputationsCount: Int!
    categories: [String!]
    pictures: [Picture]
    points: [Point]
  }

  type Point {
    username: String!
    createdAt: String!
    point: Float!
  }

  type Picture {
    url: String!
    public_id: String!
  }

  type Edge {
    node: Post!
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    startCursor: String!
  }

  type PostsResult {
    totalCount: String
    edges: [Edge]
    pageInfo: PageInfo
  }

  type Comment {
    id: ID!
    createdAt: String!
    body: String!
    author: User
  }
  type Answer {
    id: ID!
    createdAt: String!
    body: String!
    author: User
  }

  type Vote {
    id: ID!
    createdAt: String!
    username: String!
  }
  type Devote {
    id: ID!
    createdAt: String!
    username: String!
  }
  type User {
    id: ID!
    email: String!
    token: String!
    username: String!
    displayName: String!
    createdAt: String!
    avatar: Picture
    banner: Picture
    role: String!
    followedPosts: [Post!]
    followings: [User!]
    followers: [User]
  }

  scalar Upload

  type Message {
    message: String!
  }

  input RegisterInput {
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
  }

  input UsersWithRoles {
    id: String!
    username: String!
    role: String!
  }

  input ImageInputs {
    url: String!
    public_id: String!
  }

  # ROOT TYPE
  type Query {
    getUsers(userIds: [String!]): [User]
    getUser(userId: ID!): User
    getUserFollowedPosts: [Post]
    getFollowedUsersPosts(userIds: [String!]): [Post]
    posts(limit: Int, after: String): PostsResult
    getPost(postId: ID!): Post
    getUserPosts(userId: String!): [Post]
    uploads: String!
  }

  type Mutation {
    register(registerInput: RegisterInput): User!
    login(username: String!, password: String!): User!
    confirmUser(token: String!): Message!
    changePassword(
      password: String!
      newPassword: String!
      confirmNewPassword: String!
    ): Message!
    uploadUserImg(avatar: ImageInputs, banner: ImageInputs): User!
    deleteUsers(ids: [String!]!): Message!
    changeUsersRole(users: [UsersWithRoles!]!): Message!
    createPost(
      body: String!
      categories: [String!]
      pictures: [ImageInputs!]
    ): Post!
    deletePost(postId: ID!): String!
    createComment(postId: ID!, body: String!): Post!
    deleteComment(postId: ID!, commentId: ID!): Post!
    createAnswer(postId: ID!, body: String!): Post!
    deleteAnswer(postId: ID!, answerId: ID!): Post!
    votePost(postId: ID!): Post!
    devotePost(postId: ID!): Post!
    followPost(postId: ID!): Post!
    pointPost(postId: ID!, point: Float): Post!
    followUser(userId: String!): User!
  }
`;
