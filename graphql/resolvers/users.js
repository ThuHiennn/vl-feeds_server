const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");

const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../util/validators");
const { SECRET_KEY } = require("../../config");
const Post = require("../../models/Post");
const User = require("../../models/User");
const checkAuth = require("../../util/checkAuth");
const { sendEmail } = require("../../util/sendEmail");
const createConfirmationUrl = require("../../util/createConfirmationUrl");

function generateToken(user, expiresIn) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      username: user.username,
    },
    SECRET_KEY,
    {
      expiresIn,
    }
  );
}

module.exports = {
  Query: {
    async getUsers(_, { userIds }) {
      try {
        if (userIds) {
          const users = await User.find({ _id: { $in: userIds } });
          return users;
        } else {
          const users = await User.find().sort({ createdAt: -1 });
          return users;
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getUser(_, { userId }) {
      try {
        const user = await User.findById(userId);
        return user;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getUserFollowedPosts(_, __, context) {
      const { id } = checkAuth(context);
      try {
        const user = await User.findById(id);
        const followedPosts = user.followedPosts.map((postId) => {
          return Post.findById(postId);
        });
        return followedPosts;
      } catch (err) {
        throw new Error(err);
      }
    },
  },

  User: {
    followedPosts: async (parents) => {
      try {
        const followedPosts = await Promise.all(
          parents.followedPosts.map((postId) => {
            return Post.findById(postId);
          })
        );

        await Promise.all(
          followedPosts.map(async (post) => {
            const author = await User.findById(post.author);
            return { ...post, author };
          })
        );
        return followedPosts;
      } catch (err) {
        throw new Error(err);
      }
    },
    followings: async (parent) => {
      try {
        const followings = [];
        await Promise.all(
          parent.followings.map(async (userId) => {
            const user = await User.findById(userId);
            if (user) {
              followings.push(user);
            }
          })
        );
        return followings;
      } catch (err) {
        throw new Error(err);
      }
    },
    followers: async (parent) => {
      try {
        const followers = await Promise.all(
          parent.followers.map((userId) => {
            return User.findById(userId);
          })
        );
        return followers;
      } catch (err) {
        throw new Error(err);
      }
    },
  },

  Mutation: {
    async register(
      _,
      { registerInput: { username, email, password, confirmPassword } },
      context,
      info
    ) {
      //Validate user data
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      //Make sure user doesn't already exist
      const user = await User.findOne({ username });
      if (user) {
        throw new UserInputError("T??n ????ng nh???p ???? t???n t???i", {
          errors: {
            username: "T??n ????ng nh???p ???? t???n t???i",
          },
        });
      }

      //Make sure email doesn't already exist
      const usedEmailUser = await User.findOne({ email });
      if (usedEmailUser) {
        throw new UserInputError("Email ???? ???????c s??? d???ng", {
          errors: {
            email: "Email ???? ???????c s??? d???ng",
          },
        });
      }

      //hash password and create an auth token
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        username,
        password,
        createdAt: new Date().toISOString(),
      });

      const result = await newUser.save();

      const token = generateToken(result, "1h");

      await sendEmail(result.email, createConfirmationUrl(token));

      return {
        ...result._doc,
        id: result.id,
        token,
      };
    },

    async login(_, { username, password }) {
      const { errors, valid } = validateLoginInput(username, password);

      if (!valid) {
        throw new UserInputError("L???i", { errors });
      }

      const user = await User.findOne({ username });

      if (!user) {
        errors.general = "Kh??ng t??m th???y ng?????i d??ng";
        throw new UserInputError("Kh??ng t??m th???y ng?????i d??ng", { errors });
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        errors.general = "Sai m???t kh???u";
        throw new UserInputError("Sai m???t kh???u", { errors });
      }

      if (user.role === "banned") {
        errors.general = "T??i kho???n c???a b???n ???? b??? c???m";
        throw new UserInputError("T??i kho???n c???a b???n ???? b??? c???m", { errors });
      }

      if (!user.confirmed) {
        errors.general = "T??i kho???n c???a b???n ch??a ???????c x??c nh???n";
        throw new UserInputError("T??i kho???n c???a b???n ch??a ???????c x??c nh???n", {
          errors,
        });
      }
      const token = generateToken(user, "7d");
      return {
        ...user._doc,
        id: user._id,
        token,
        role: user.role,
      };
    },

    async confirmUser(_, { token }) {
      try {
        const { id } = jwt.verify(token, SECRET_KEY);
        const user = await User.findById(id);
        if (!user) {
          return {
            message: "Kh??ng t??m th???y t??i kho???n",
          };
        }
        user.confirmed = true;
        await user.save();
        return {
          message: "X??c nh???n t??i kho???n th??nh c??ng",
        };
      } catch (err) {
        throw new Error(err);
      }
    },

    async changePassword(
      _,
      { password, newPassword, confirmNewPassword },
      context
    ) {
      const { id } = checkAuth(context);
      const user = await User.findById(id);

      try {
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
          throw new UserInputError("Sai m???t kh???u");
        }

        if (newPassword !== confirmNewPassword) {
          throw new UserInputError("M???t kh???u kh??ng kh???p");
        }

        const newMatchOld = await bcrypt.compare(newPassword, user.password);
        if (newMatchOld) {
          throw new UserInputError(
            "M???t kh???u m???i kh??ng ???????c tr??ng v???i m???t kh???u c??"
          );
        }

        const newHashedPassword = await bcrypt.hash(newPassword, 12);

        user.password = newHashedPassword;

        await user.save();
        return {
          message: "Thay ?????i m???t kh???u th??nh c??ng!",
        };
      } catch (err) {
        throw new Error(err);
      }
    },

    async deleteUsers(_, { ids }) {
      ids.map(async (id) => {
        await User.findByIdAndDelete(id);
      });

      return {
        message: "X??a th??nh c??ng",
      };
    },

    async changeUsersRole(_, { users }) {
      users.map(async (user) => {
        const { id, role } = user;
        const foundUser = await User.findById(id);
        foundUser.role = role;
        await foundUser.save();
      });

      return {
        message: "Thay ?????i quy???n th??nh c??ng",
      };
    },

    async followUser(_, { userId }, context) {
      const { id } = checkAuth(context);
      const user = await User.findById(id);
      const userToFollow = await User.findById(userId);

      if (!user || !userToFollow) {
        throw new UserInputError("Kh??ng t??m th???y ng?????i d??ng");
      }

      if (userToFollow) {
        if (
          user.followings.find(
            (userId) => userId.toString() === userToFollow.id
          )
        ) {
          user.followings = user.followings.filter((userId) => {
            return userId.toString() !== userToFollow.id;
          });
          await user.save();
          userToFollow.followers = userToFollow.followers.filter((userId) => {
            return userId.toString() !== user.id;
          });
          await userToFollow.save();
        } else {
          user.followings.push(userToFollow);
          await user.save();
          userToFollow.followers.push(user);
          await userToFollow.save();
        }

        return userToFollow;
      }
    },
  },
};
