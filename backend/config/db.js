const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {});
    console.log("====================================");
    console.log("MongoDB Connected");
    console.log("====================================");
  } catch (err) {
    console.error("====================================");
    console.error("MongoDB Connection Failed", err);
    console.error("====================================");
    process.exit(1); // Exit process with failure
  }
};
module.exports = connectDB;
