const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  MONGODB: `mongodb+srv://dbUser01:${process.env.DB_USER_PASSWORD}@mern-latn-cluster.3oyhs.mongodb.net/mern-latn?retryWrites=true&w=majority`,
  PORT: `${process.env.PORT}`,
  SECRET_KEY: `${process.env.SECRET_KEY}`,
  URL: `${process.env.URL}`,
};
