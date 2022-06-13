const { model, Schema } = require("mongoose");

const nofificationSchema = new Schema({
  from: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  body: String,
  createdAt: String,
});

module.exports = model("Notification", nofificationSchema);
