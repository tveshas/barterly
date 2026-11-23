import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import User from "../src/models/User.model.js";
import Skill from "../src/models/Skill.model.js";
import Category from "../src/models/Category.model.js";
import BarterRequest from "../src/models/BarterRequest.model.js";

await mongoose.connect(process.env.MONGODB_URI);
const cats = Object.fromEntries((await Category.find()).map((c) => [c.slug, c._id]));
const cat = (slug) => cats[slug] ?? Object.values(cats)[0];

// [name, email, location, bio, wants, skills[]]
// skill: [title, description, categorySlug, tags, level, mode, availability, outcomes]
const people = [
  ["Priya Sharma", "priya@demo.com", "Mumbai, India", "Full-stack developer who loves teaching React.", ["Guitar", "Spanish"],
    [["React & Next.js Mentoring", "Build modern web apps with React hooks, routing and state management through hands-on projects.", "technology", ["react", "javascript", "web"], "advanced", "online", "Weekends", ["Build a React app", "Understand hooks"]],
     ["Git & GitHub Workflow", "Learn branching, pull requests and collaboration like a pro.", "technology", ["git", "github"], "intermediate", "online", "Evenings", ["Use branches", "Open PRs"]]]],
  ["Marco Rossi", "marco@demo.com", "Rome, Italy", "Chef and part-time language tutor.", ["Web Design", "Photography"],
    [["Italian Cooking Basics", "Fresh pasta, sauces and classic Italian dishes from scratch.", "lifestyle", ["cooking", "italian", "pasta"], "intermediate", "both", "Weekday evenings", ["Make fresh pasta", "Cook 3 sauces"]],
     ["Conversational Italian", "Practice speaking Italian for travel and daily life.", "language", ["italian", "speaking"], "beginner", "online", "Flexible", ["Hold simple conversations"]]]],
  ["Aisha Khan", "aisha@demo.com", "Dubai, UAE", "Graphic designer & illustrator.", ["Python", "Video Editing"],
    [["Logo & Brand Design", "Create memorable logos and brand identities using Figma and Illustrator.", "design", ["logo", "branding", "figma"], "advanced", "online", "Mon-Thu", ["Design a logo", "Build a brand kit"]],
     ["Digital Illustration", "Procreate and Photoshop techniques for character art.", "art", ["illustration", "procreate"], "intermediate", "online", "Weekends", ["Draw characters"]]]],
  ["Liam O'Connor", "liam@demo.com", "Dublin, Ireland", "Musician with 10 years of gigging experience.", ["Cooking", "Fitness"],
    [["Acoustic Guitar Lessons", "From first chords to fingerstyle — all levels welcome.", "music", ["guitar", "acoustic"], "advanced", "both", "Evenings", ["Play 10 songs", "Read tabs"]],
     ["Music Production in Ableton", "Make beats and mix tracks in Ableton Live.", "music", ["ableton", "production"], "intermediate", "online", "Weekends", ["Produce a track"]]]],
  ["Sofia Martinez", "sofia@demo.com", "Madrid, Spain", "Marketing consultant and native Spanish speaker.", ["Data Analysis", "Guitar"],
    [["Spanish for Beginners", "Learn practical Spanish with fun conversation practice.", "language", ["spanish", "beginner"], "beginner", "online", "Flexible", ["Introduce yourself", "Order food"]],
     ["Social Media Marketing", "Grow an audience on Instagram and LinkedIn with a content strategy.", "professional-services", ["marketing", "social-media"], "advanced", "online", "Weekdays", ["Plan a content calendar"]]]],
  ["Daniel Kim", "daniel@demo.com", "Seoul, South Korea", "Data analyst, photography hobbyist.", ["Spanish", "Cooking"],
    [["Python for Data Analysis", "Pandas, NumPy and charts to explore real datasets.", "technology", ["python", "pandas", "data"], "advanced", "online", "Evenings", ["Clean data", "Make charts"]],
     ["Portrait Photography", "Lighting, posing and editing for stunning portraits.", "art", ["photography", "portrait"], "intermediate", "in-person", "Weekends", ["Shoot portraits"]]]],
  ["Emma Wilson", "emma@demo.com", "London, UK", "Certified personal trainer and yoga teacher.", ["Web Development", "Italian"],
    [["Home Workout Coaching", "Personalized bodyweight training plans you can do anywhere.", "lifestyle", ["fitness", "workout"], "intermediate", "both", "Mornings", ["Follow a 4-week plan"]],
     ["Beginner Yoga", "Gentle yoga flows for flexibility and stress relief.", "lifestyle", ["yoga", "wellness"], "beginner", "online", "Mornings", ["Learn 12 poses"]]]],
  ["Rahul Verma", "rahul@demo.com", "Bengaluru, India", "Video editor and motion designer.", ["Guitar", "Public Speaking"],
    [["Video Editing with Premiere Pro", "Cut, color and export professional videos.", "design", ["video", "premiere", "editing"], "advanced", "online", "Evenings", ["Edit a short film"]],
     ["Intro to After Effects", "Motion graphics and title animations.", "design", ["aftereffects", "motion"], "intermediate", "online", "Weekends", ["Animate a title"]]]],
];

const upsertSkill = async (owner, s) => {
  const [title, description, slug, tags, level, deliveryMode, availability, learningOutcomes] = s;
  let doc = await Skill.findOne({ title, offeredBy: owner._id });
  if (!doc) {
    doc = await Skill.create({ title, description, category: cat(slug), tags, level, deliveryMode, availability,
      learningOutcomes, offeredBy: owner._id, isVerified: true, verificationStatus: "approved", viewCount: Math.floor(Math.random() * 200) });
    await User.updateOne({ _id: owner._id }, { $addToSet: { skillsOffered: doc._id } });
  }
  return doc;
};

const made = {};
for (const [name, email, location, bio, skillsWanted, skills] of people) {
  let u = await User.findOne({ email });
  if (!u) u = await User.create({ name, email, password: "Demo@1234", location, bio, skillsWanted, isVerified: true, isActive: true,
    averageRating: +(4 + Math.random()).toFixed(1), totalReviews: 3 + Math.floor(Math.random() * 20) });
  made[email] = { user: u, skills: [] };
  for (const s of skills) made[email].skills.push(await upsertSkill(u, s));
}

// Give Alice and Bob skills so they can send requests
const mine = {
  "alice@test.com": [["Beginner Photography", "Camera basics, composition and light.", "art", ["photography"], "beginner", "both", "Weekends", ["Shoot in manual"]],
                     ["JavaScript Fundamentals", "Variables, functions, DOM and async basics.", "technology", ["javascript"], "intermediate", "online", "Evenings", ["Build a small app"]]],
  "bob@test.com": [["Public Speaking", "Structure talks and deliver with confidence.", "professional-services", ["speaking"], "intermediate", "both", "Weekdays", ["Give a 5-min talk"]]],
};
for (const [email, list] of Object.entries(mine)) {
  const u = await User.findOne({ email });
  if (!u) continue;
  made[email] = { user: u, skills: [] };
  for (const s of list) made[email].skills.push(await upsertSkill(u, s));
}

// Incoming requests TO Alice and Bob from the demo people
const reqs = [
  ["priya@demo.com", "alice@test.com", 0, 0, "Hi! I'd love to learn photography — happy to teach you React in return."],
  ["marco@demo.com", "alice@test.com", 0, 1, "Ciao! I can teach you Italian cooking in exchange for JavaScript help."],
  ["liam@demo.com", "alice@test.com", 0, 0, "Guitar lessons for photo tips? Let me know!"],
  ["aisha@demo.com", "bob@test.com", 0, 0, "Would love public speaking coaching — I can help with logo design."],
  ["emma@demo.com", "bob@test.com", 0, 0, "Fitness coaching for public speaking practice?"],
  ["sofia@demo.com", "bob@test.com", 0, 0, "I can teach you Spanish while you help me with my talks."],
];
let n = 0;
for (const [from, to, oi, ri, message] of reqs) {
  const sender = made[from], receiver = made[to];
  if (!sender || !receiver) continue;
  const offeredSkill = sender.skills[oi]._id, requestedSkill = receiver.skills[ri]._id;
  if (await BarterRequest.findOne({ sender: sender.user._id, receiver: receiver.user._id, requestedSkill })) continue;
  await BarterRequest.create({ sender: sender.user._id, receiver: receiver.user._id, offeredSkill, requestedSkill, message });
  n++;
}
console.log(`Seeded ${people.length} demo users, their skills, and ${n} new requests.`);
process.exit(0);
