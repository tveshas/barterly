// Gives every test/demo user realistic ratings by creating completed barters
// between them, each with a review. Rating averages are computed by the
// Review model's own hooks. Safe to re-run.
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import User from "../src/models/User.model.js";
import Skill from "../src/models/Skill.model.js";
import BarterRequest from "../src/models/BarterRequest.model.js";
import Review from "../src/models/Review.model.js";

const EMAILS = [
  "alice@test.com", "bob@test.com", "priya@demo.com", "marco@demo.com", "aisha@demo.com",
  "liam@demo.com", "sofia@demo.com", "daniel@demo.com", "emma@demo.com", "rahul@demo.com",
];
const RATINGS = [5, 4, 5, 5, 4, 4, 5, 3, 5, 4];
const COMMENTS = [
  "Patient and clear. I learned a lot in just a few sessions!",
  "Great teacher, very well prepared and friendly.",
  "Fair exchange and a really fun time. Would swap again.",
  "Knows the subject inside out and explains it simply.",
  "Good session, a bit rushed at the end but very helpful.",
  "Super reliable and always on time. Highly recommended.",
];

await mongoose.connect(process.env.MONGODB_URI);
const users = (await User.find({ email: { $in: EMAILS } })).sort(
  (a, b) => EMAILS.indexOf(a.email) - EMAILS.indexOf(b.email),
);
await User.updateMany({ email: { $in: EMAILS } }, { isTestUser: true });

const skillOf = {};
for (const u of users) skillOf[u._id] = (await Skill.find({ offeredBy: u._id }).sort({ createdAt: 1 }))[0];

let made = 0;
users.forEach((reviewee, i) => {
  reviewee._reviewers = [1, 2, 3, 4].map((k) => users[(i + k) % users.length]);
});
for (const [i, reviewee] of users.entries()) {
  for (const [j, reviewer] of reviewee._reviewers.entries()) {
    const offeredSkill = skillOf[reviewer._id], requestedSkill = skillOf[reviewee._id];
    if (!offeredSkill || !requestedSkill) continue;
    let barter = await BarterRequest.findOne({
      sender: reviewer._id, receiver: reviewee._id, requestedSkill: requestedSkill._id, status: "completed",
    });
    if (!barter) {
      barter = await BarterRequest.create({
        sender: reviewer._id, receiver: reviewee._id, offeredSkill: offeredSkill._id, requestedSkill: requestedSkill._id,
        message: "Let's swap!", status: "completed", completedAt: new Date(Date.now() - (j + 1) * 6 * 86400000),
      });
    }
    if (!(await Review.findOne({ reviewer: reviewer._id, barter: barter._id }))) {
      await Review.create({
        reviewer: reviewer._id, reviewee: reviewee._id, barter: barter._id,
        rating: RATINGS[(i * 3 + j) % RATINGS.length], comment: COMMENTS[(i + j) % COMMENTS.length],
      });
      made++;
    }
  }
}
for (const u of users) {
  const count = await BarterRequest.countDocuments({ status: "completed", $or: [{ sender: u._id }, { receiver: u._id }] });
  await User.updateOne({ _id: u._id }, { totalBarters: count });
}
const out = await User.find({ email: { $in: EMAILS } }).select("name email averageRating totalReviews totalBarters");
console.log(`Created ${made} new reviews.`);
out.forEach((u) => console.log(`${u.email.padEnd(18)} ${u.averageRating}★ (${u.totalReviews} reviews, ${u.totalBarters} barters)`));
process.exit(0);
