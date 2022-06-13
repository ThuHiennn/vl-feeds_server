const bcrypt = require("bcrypt");

const User = require("../models/User");
const checkAuth = require("./checkAuth");

module.exports.validateRegisterInput = (
  username,
  email,
  password,
  confirmPassword
) => {
  const errors = {};

  if (username.trim() === "") {
    errors.username = "Tên đăng nhập không được để trống";
  }

  if (email.trim() === "") {
    errors.email = "Email không được để trống";
  } else {
    const regEx =
      /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
    if (!email.match(regEx)) {
      errors.email = "Email không hợp lệ";
    }
  }

  if (password.trim() === "") {
    errors.password = "Mật khẩu không được để trống";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Mật khẩu không khớp";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateLoginInput = (username, password) => {
  const errors = {};
  if (username.trim() === "") {
    errors.username = "Tên đăng nhập không được để trống";
  }
  if (password.trim() === "") {
    errors.password = "Mật khẩu không được để trống";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};
