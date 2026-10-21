import mongoose from "mongoose";
import bcrypt from "bcrypt";

const preferencesSchema = new mongoose.Schema({
  preferredDifficulties: {
    type: [String],
    enum: ["easy", "moderate", "difficult"],
    default: [],
  },
  interests: {
    type: [String],
    default: [],
  },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, minlength: 8, select: false },
  authProvider: { type: String, enum: ["password", "google"], default: "password" },
  googleSubject: { type: String, default: null, sparse: true, unique: true },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
  preferences: { type: preferencesSchema, default: () => ({}) },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
