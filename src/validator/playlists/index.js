const InvariantError = require('../../exceptions/InvariantError');
const { PostPlaylistPayloadSchema, PostSongIntoPlaylistPayloadSchema, DeleteSongFromPlaylistPayloadSchema } = require('./schema');

const PlaylistsValidator = {
  validatePostPlaylistPayload: (payload) => {
    const validationResult = PostPlaylistPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePostSongintoPlaylistPayload: (payload) => {
    const validationResult = PostSongIntoPlaylistPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateDeleteSongFromPlaylistPayload: (payload) => {
    const validationResult = DeleteSongFromPlaylistPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistsValidator;
