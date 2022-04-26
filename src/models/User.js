import { Schema, model } from 'mongoose';
import { hash ,compare } from 'bcrypt';

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: [true, 'username is required'],
    },
    firstName: {
      type: String,
      required: [true, 'firstName is required'],
    },
    lastName: {
      type: String,
      required: [true, 'lastName is required'],
    },
    email: {
      type: String,
      required: [true, 'email is required'],
    },
    avatar: {
      type: String,
      default: 'default.png'
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await hash(this.password, 12);
  next();
});
//creating an instance method (This is avaliable to all user documents)
userSchema.methods.comparePasswords = async function (
  candidatePassword,
  userPassword
) {
  return await compare(candidatePassword, userPassword);
};

export default new model('User', userSchema);
