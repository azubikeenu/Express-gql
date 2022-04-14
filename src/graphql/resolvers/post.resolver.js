import { StatusCodes } from 'http-status-codes';

import { ErrorResponse } from '../../utils';

import { DateTimeResolver } from 'graphql-scalars'


import {
  NOTIFICATION_MESSAGES,
  ERROR_MESSAGES,
  CUSTOM_TYPES,
} from '../../constants';

export default {
  DateTime : DateTimeResolver,

  Query: {
    getAllPosts: async (_, {}, { Post }) => {
      const posts = await Post.find();
      return posts;
    },
    getPost: async (_, { id }, { Post }) => {
      const post = await Post.findById(id);

      if (!post) {
        const error = new ErrorResponse(
          false,
          ERROR_MESSAGES.notFound,
          StatusCodes.NOT_FOUND
        );
        return { __typename: CUSTOM_TYPES.errorResponse, ...error };
      }

      return { __typename: CUSTOM_TYPES.post, ...post._doc, id: post._id };
    },
  },
  Mutation: {
    createPost: async (_, { createPostInput }, { Post }) => {
      const post = await Post.create(createPostInput);
      return {
        __typename: CUSTOM_TYPES.post,
        ...post._doc,
        id: post._id,
      };
    },
    updatePost: async (_, { updatePostInput, id }, { Post }) => {
      const post = await Post.findByIdAndUpdate(id, updatePostInput, {
        new: true,
        runValidations: true,
      });
      if (!post) {
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
        post,
      };

      return { __typename: CUSTOM_TYPES.postMutationResponse, ...response };
    },

    deletePost: async (_, { id }, { Post }) => {
      const post = await Post.findByIdAndDelete(id);
      if (!post) {
        const error = new ErrorResponse(
          false,
          ERROR_MESSAGES.notFound,
          StatusCodes.NOT_FOUND
        );
        return { __typename: CUSTOM_TYPES.errorResponse, ...error };
      }

      const response = {
        code: StatusCodes.NO_CONTENT,
        success: true,
        message: NOTIFICATION_MESSAGES.deleted,
      };
      return { __typename: CUSTOM_TYPES.postMutationResponse, ...response };
    },
  },
};
