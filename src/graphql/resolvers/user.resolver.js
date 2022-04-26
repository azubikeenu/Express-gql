import { StatusCodes } from 'http-status-codes';

import { helperUtils } from '../../utils';

import {
  NOTIFICATION_MESSAGES,
  ERROR_MESSAGES,
  CUSTOM_TYPES,
} from '../../constants';

export default {
  Query: {
    findById: async (_, { id }, { User }) => {
      const user = await User.findById(id);
      if (!user) {
        return helperUtils.handleError(
          StatusCodes.NOT_FOUND,
          ERROR_MESSAGES.notFound
        );
      }
      const userDoc = user._doc;
      userDoc.id = userDoc._id;
      return { __typename: CUSTOM_TYPES.user, ...userDoc };
    },
    authenticateUser: async (_, { userName, password }, { User }) => {
      const user = await User.findOne({ userName });
      if (!user || !(await user.comparePasswords(password, user.password))) {
        return helperUtils.handleError(
          StatusCodes.UNAUTHORIZED,
          ERROR_MESSAGES.invalidCredentials
        );
      }
      const response = helperUtils.createTokenResponse(user);
      return { __typename: CUSTOM_TYPES.userAuthResponse, ...response };
    },
  },
  Mutation: {
    createUser: async (_, { userInput }, { User }) => {
      const { email, userName } = userInput;
      const foundUser = await User.find({ $or: [{ email }, { userName }] });
      if (foundUser.length > 0) {
        return helperUtils.handleError(
          StatusCodes.BAD_REQUEST,
          ERROR_MESSAGES.alreadyExists
        );
      }
      const user = await User.create(userInput);
      const response = helperUtils.createTokenResponse(
        user,
        NOTIFICATION_MESSAGES.created
      );
      return { __typename: CUSTOM_TYPES.userAuthResponse, ...response };
    },
  },
};
