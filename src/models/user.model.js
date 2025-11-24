const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const CONSTANT_ENUM = require('../helper/constant-enums');

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    avatar: {
      type: String,
      default: '',
    },

    phoneNumber: {
      type: String,
      trim: true,
      default: '',
    },

    role: {
      type: String,
      enum: Object.values(CONSTANT_ENUM.USER_ROLE),
      default: CONSTANT_ENUM.USER_ROLE.USER,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    verificationToken: {
      type: String,
      select: false,
      default: null,
    },

    verificationTokenExpires: {
      type: Date,
      default: null,
    },

    resetPasswordToken: {
      type: String,
      select: false,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },

    wallet: {
      balance: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: 'USD',
      },
      transactions: [
        {
          amount: Number,
          type: { type: String, enum: ['credit', 'debit'] },
          note: String,
          createdAt: { type: Date, default: Date.now },
        },
      ],
    },

    spinStats: {
      totalPurchases: { type: Number, default: 0 },
      totalSpinsAvailable: { type: Number, default: 0 },
      spinsUsedToday: { type: Number, default: 0 },
      lastSpinDate: { type: Date, default: null },
    },
  },

  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.verificationToken;
        delete ret.verificationTokenExpires;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ isDeleted: 1 });
userSchema.index({ 'wallet.balance': 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  next();
});

userSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  const password = update?.password || update?.$set?.password;

  if (password) {
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    if (update.$set) update.$set.password = hashed;
    else update.password = hashed;
  }

  next();
});

userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    phoneNumber: this.phoneNumber,
    role: this.role,
    isEmailVerified: this.isEmailVerified,
    isActive: this.isActive,
    wallet: this.wallet,
    spinStats: this.spinStats,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = mongoose.model('User', userSchema);
module.exports = { User };
