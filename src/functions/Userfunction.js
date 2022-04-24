import { sign } from 'jsonwebtoken';
import { SECRET } from '../config';
import { pick } from 'lodash';

export const issueToken = (user) => {
  return sign(user, SECRET, { expiresIn: 60 * 60 * 24 });
};

export const serializeUser = (user) => {
  const userDoc = user._doc;
  userDoc.id = userDoc._id;
  return pick(userDoc, ['id', 'email', 'userName']);
};
