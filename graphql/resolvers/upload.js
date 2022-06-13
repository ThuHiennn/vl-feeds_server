const checkAuth = require("../../util/checkAuth");
const User = require("../../models/User");
const cloudinary = require("cloudinary").v2;

module.exports = {
  Mutation: {
    uploadUserImg: async (parent, { avatar, banner }, context) => {
      const { id } = checkAuth(context);
      const foundUser = await User.findById(id);
      if (foundUser.avatar.public_id && avatar) {
        await cloudinary.uploader.destroy(foundUser.avatar.public_id);
      }
      if (foundUser.banner.public_id && banner) {
        await cloudinary.uploader.destroy(foundUser.banner.public_id);
      }
      if (avatar) {
        foundUser.avatar = avatar;
      }
      if (banner) {
        foundUser.banner = banner;
      }
      await foundUser.save();

      return foundUser;
    },
  },
};
