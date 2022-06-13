const jwt = require("jsonwebtoken");
const { AuthenticationError } = require("apollo-server");

const { SECRET_KEY } = require("../config");

module.exports = (context) => {
  const authHeader = context.req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split("Bearer ")[1];
    if (token) {
      try {
        const user = jwt.verify(token, SECRET_KEY);
        return user;
      } catch (err) {
        throw new AuthenticationError("Token đã hết hạn hoặc không đúng");
      }
    }
    throw new Error('Auth token phải ở định dạng "Bearer [token]"');
  }
  throw new Error("Không tìm thấy Authorization header");
};
