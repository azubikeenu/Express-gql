import { StatusCodes } from 'http-status-codes';
import ErrorResponse from './errorResponse';
import { userFunc } from '../functions';
import { CUSTOM_TYPES } from '../constants';

export default {
  createTokenResponse: (user, message = null) => {
    const serializedUser = userFunc.serializeUser(user);
    const token = userFunc.issueToken(serializedUser);
    const response = {
      code: StatusCodes.OK,
      success: true,
      message,
      user,
      token,
    };
    return response;
  },

  handleError: (statusCode, errorMessage) => {
    const error = new ErrorResponse(false, errorMessage, statusCode);
    return { __typename: CUSTOM_TYPES.errorResponse, ...error };
  },
};
