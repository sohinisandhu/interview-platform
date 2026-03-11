const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB: ${conn.connection.host}`);

    mongoose.connection.on("disconnected", () => console.warn("⚠️  MongoDB disconnected"));
    mongoose.connection.on("reconnected", () => console.log("✅ MongoDB reconnected"));
  } catch (err) {
    console.error("❌ MongoDB failed:", err.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
