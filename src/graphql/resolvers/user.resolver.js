import { StatusCodes } from 'http-status-codes';

import { ErrorResponse } from '../../utils';

import { userFunc } from '../../functions';

import {
  NOTIFICATION_MESSAGES,
  ERROR_MESSAGES,
  CUSTOM_TYPES,
} from '../../constants';

export default {
  Query: {
    user_info: (_, {}, { User }) => {
      return 'hello user resolver ';
    },
    findById: async (_, { id }, { User }) => {
      const user = await User.findById(id);
      if (!user) {
        const error = new ErrorResponse(
          false,
          ERROR_MESSAGES.notFound,
          StatusCodes.NOT_FOUND
        );
        return { __typename: CUSTOM_TYPES.errorResponse, ...error };
      }
      const response = {
        code: StatusCodes.OK,
        success: true,
        message: NOTIFICATION_MESSAGES.updated,
        user,
      };

      return { __typename: CUSTOM_TYPES.userMutationResponse, ...response };
    },
  },
  Mutation: {
    createUser: async (_, { userInput }, { User }) => {
      const { email, username } = userInput;
      const foundUser = await User.find({ $or: [{ email }, { username }] });

      if (foundUser.length > 0) {
        const error = new ErrorResponse(
          false,
          ERROR_MESSAGES.alreadyExists,
          StatusCodes.BAD_REQUEST
        );

        return { __typename: CUSTOM_TYPES.errorResponse, ...error };
      }

      const user = await User.create(userInput);

      const serializedUser = userFunc.serializeUser(user);

      const token = userFunc.issueToken(serializedUser);

      const response = {
        code: StatusCodes.OK,
        success: true,
        message: NOTIFICATION_MESSAGES.created,
        user,
        token,
      };
      return { __typename: CUSTOM_TYPES.userAuthResponse, ...response };
    },
  },
};
