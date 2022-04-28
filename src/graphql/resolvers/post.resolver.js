import { StatusCodes } from 'http-status-codes';

import { helperUtils } from '../../utils';

import { DateTimeResolver } from 'graphql-scalars';

import { ApolloError } from 'apollo-server-core';

import {
  NOTIFICATION_MESSAGES,
  ERROR_MESSAGES,
  CUSTOM_TYPES,
} from '../../constants';

export default {
  DateTime: DateTimeResolver,

  Query: {
    getAllPosts: async (_, {}, { Post }) => {
      try {
        const posts = await Post.find().populate('author');
        return posts;
      } catch (err) {
        throw new ApolloError(err.message, StatusCodes.INTERNAL_SERVER_ERROR);
      }
    },
    getPost: async (_, { id }, { Post }) => {
      try {
        const post = await Post.findById(id);
        if (!post) {
          return helperUtils.handleError(
            StatusCodes.NOT_FOUND,
            NOTIFICATION_MESSAGES.notFound
          );
        }
        return { __typename: CUSTOM_TYPES.post, ...post._doc, id: post._id };
      } catch (err) {
        throw new ApolloError(err.message, StatusCodes.INTERNAL_SERVER_ERROR);
      }
    },
  },
  Mutation: {
    createPost: async (_, { createPostInput }, { Post, user }) => {
      try {
        const post = Post.create({
          ...createPostInput,
          author: user._id,
        }).then((post) => post.populate('author'));

        return {
          __typename: CUSTOM_TYPES.post,
          ...post._doc,
          id: post._id,
        };
      } catch (err) {
        throw new ApolloError(err.message, StatusCodes.INTERNAL_SERVER_ERROR);
      }
    },
    updatePost: async (_, { updatePostInput, id }, { Post ,user}) => {
      try {
        const post = await Post.findOneAndUpdate(
          { _id: id, author: user._id.toString() },
          updatePostInput,
          {
            new: true,
            runValidations: true,
          }
        );
        if (!post) {
          return helperUtils.handleError(
            StatusCodes.UNAUTHORIZED,
            ERROR_MESSAGES.notAuthorized
          );
        }
        const response = {
          code: StatusCodes.OK,
          success: true,
          message: NOTIFICATION_MESSAGES.updated,
          post,
        };

        return { __typename: CUSTOM_TYPES.postMutationResponse, ...response };
      } catch (err) {
        throw new ApolloError(err.message, StatusCodes.INTERNAL_SERVER_ERROR);
      }
    },

    deletePost: async (_, { id }, { Post ,user }) => {
      try {
        const post = await Post.findOneAndDelete({
          _id: id,
          author: user._id.toString(),
        });
        if (!post) {
          return helperUtils.handleError(
            StatusCodes.UNAUTHORIZED,
            ERROR_MESSAGES.notAuthorized
          );
        }
        const response = {
          code: StatusCodes.NO_CONTENT,
          success: true,
          message: NOTIFICATION_MESSAGES.deleted,
        };
        return { __typename: CUSTOM_TYPES.postMutationResponse, ...response };
      } catch (err) {
        throw new ApolloError(err.message, StatusCodes.INTERNAL_SERVER_ERROR);
      }
    },
  },
};
