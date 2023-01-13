const Joi = require('joi');

const CollaborationSchemaPayload = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required(),
});

module.exports = CollaborationSchemaPayload;
