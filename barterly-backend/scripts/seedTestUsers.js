import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import User from "../src/models/User.model.js";

await mongoose.connect(process.env.MONGODB_URI);
for (const [name, email] of [["Alice", "alice@test.com"], ["Bob", "bob@test.com"]]) {
  if (await User.findOne({ email })) { console.log("exists", email); continue; }
  await User.create({ name, email, password: "Test@1234", role: "user", isVerified: true, isActive: true, bio: `Hi, I'm ${name}`, location: "Remote" });
  console.log("created", email);
}
process.exit(0);
