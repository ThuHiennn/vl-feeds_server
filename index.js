const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { graphqlUploadExpress } = require("graphql-upload");
const mongoose = require("mongoose");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const { MONGODB } = require("./config");

const PORT = process.env.PORT || 5000;

const app = express();
app.use(graphqlUploadExpress());
app.use(express.static("public"));
app.use(express.json({ limit: "50mb" }));
app.use(cors());

//Cloudinary----------------------------------------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

//GraphQL---------------------------------------------------
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req }),
});

//MongoDB----------------------------------------------------
const connectDB = async () => {
  try {
    mongoose
      .connect(MONGODB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(async () => {
        console.log("MongoDB Connected...");
        await server.start();

        server.applyMiddleware({ app });

        await new Promise((r) => {
          console.log(`Server started on port ${process.env.URL}/graphql`);
          return app.listen({ port: PORT });
        });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    throw new Error(error);
  }
};
connectDB();
