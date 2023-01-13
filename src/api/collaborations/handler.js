class CollaborationsHandler {
  constructor(service, playlistsService, usersService, validator) {
    this._service = service;
    this._playlistsService = playlistsService;
    this._usersService = usersService;
    this._validator = validator;
  }

  async postCollaborationHandler(request, h) {
    // Validating request
    this._validator.validateCollaborationPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    // Verifying playlist access
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    // Verifying user by id
    await this._usersService.verifyUserById(userId);

    const collaborationId = await this._service.addCollaboration(playlistId, userId);

    // Response
    const res = h.response({
      status: 'success',
      data: {
        collaborationId,
      },
    });

    res.code(201);
    return res;
  }

  async deleteCollaborationHandler(request) {
    // Validating request
    this._validator.validateCollaborationPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    // Verifying playlist owner
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    // Verifying user by id
    await this._usersService.verifyUserById(userId);

    await this._service.deleteCollaboration(playlistId, userId);

    return {
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    };
  }
}

module.exports = CollaborationsHandler;
