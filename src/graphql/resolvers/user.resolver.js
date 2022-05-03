import { StatusCodes } from 'http-status-codes';

import { helperUtils } from '../../utils';
import { ApolloError } from 'apollo-server-core';
import { userValidators } from '../../validators';

import {
  NOTIFICATION_MESSAGES,
  ERROR_MESSAGES,
  CUSTOM_TYPES,
} from '../../constants';

export default {
  Query: {
    findById: async (_, { id }, { User }) => {
      try {
        const user = await User.findById(id);
        if (!user) {
          return helperUtils.handleError(
            StatusCodes.NOT_FOUND,
            ERROR_MESSAGES.notFound
          );
        }
        return { __typename: CUSTOM_TYPES.user, ...user._doc, id: user._id };
      } catch (err) {
        throw new ApolloError(err.message, StatusCodes.INTERNAL_SERVER_ERROR);
      }
    },
    authenticateUser: async (_, { userName, password }, { User }) => {
      try {
        await userValidators.UserAuthenticationRules.validate(
          { userName, password },
          { abortEarly: false }
        );

        const user = await User.findOne({ userName });
        if (!user || !(await user.comparePasswords(password, user.password))) {
          return helperUtils.handleError(
            StatusCodes.UNAUTHORIZED,
            ERROR_MESSAGES.invalidCredentials
          );
        }
        const response = helperUtils.createTokenResponse(user);
        return { __typename: CUSTOM_TYPES.userAuthResponse, ...response };
      } catch (err) {
        throw new ApolloError(err.message, StatusCodes.INTERNAL_SERVER_ERROR);
      }
    },
    authUserProfile: async (_, {}, { user, User }) => {
      try {
        const foundUser = await User.findById(user._id);
        if (!foundUser) {
          return helperUtils.handleError(
            StatusCodes.NOT_FOUND,
            ERROR_MESSAGES.notFound
          );
        }

        return { __typename: CUSTOM_TYPES.user, ...user._doc, id: user._id };
      } catch (err) {
        const errors = err?.errors;
        throw new ApolloError(err.message, StatusCodes.INTERNAL_SERVER_ERROR, {
          errors,
        });
      }
    },
  },
  Mutation: {
    createUser: async (_, { userInput }, { User }) => {
      try {
        await userValidators.UserRegisterationRules.validate(
          { ...userInput },
          { abortEarly: false }
        );
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
      } catch (err) {
        const errors = err?.errors;
        throw new ApolloError(err.message, StatusCodes.INTERNAL_SERVER_ERROR, {
          errors,
        });
      }
    },
  },
};
