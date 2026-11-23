import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      // Optional: users sign in with Google and have no password
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    // Seeded demo/test accounts: the only accounts the opt-in test login can use in production
    isTestUser: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
      index: true,
      sparse: true,
    },
    // Hourly rate in INR used by the AI fair-trade equalizer
    hourlyRate: {
      type: Number,
      min: [0, "Hourly rate cannot be negative"],
      max: [10000, "Hourly rate is too high"],
      default: 0,
    },
    // Fake wallet money (INR) for testing cash top-ups; there is no payment gateway
    walletBalance: {
      type: Number,
      default: 5000,
      min: [0, "Wallet balance cannot be negative"],
    },
    avatar: {
      url: {
        type: String,
        default: "",
      },
      public_id: {
        type: String,
        default: "",
      },
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: "",
    },
    location: {
      type: String,
      maxlength: [100, "Location cannot exceed 100 characters"],
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    skillsOffered: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
      },
    ],
    skillsWanted: [
      {
        type: String,
        trim: true,
      },
    ],
    portfolioLinks: [
      {
        type: String,
        trim: true,
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
      select: false,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalBarters: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Email already has unique index from schema definition
// No need for additional index

// Hash password before saving
userSchema.pre("save", async function () {
  // Only hash if password is modified
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// Method to get public profile (exclude sensitive fields)
userSchema.methods.toPublicProfile = function () {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  delete user.__v;
  return user;
};

const User = mongoose.model("User", userSchema);

export default User;
