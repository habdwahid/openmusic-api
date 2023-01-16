class ExportsHandler {
  constructor(service, playlistsService, validator) {
    this._service = service;
    this._playlistsService = playlistsService;
    this._validator = validator;
  }

  async postExportPlaylistHandler(request, h) {
    // Validating request
    this._validator.validateExportPlaylistPayload(request.payload);

    const { playlistId } = request.params;
    const { targetEmail } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const message = {
      playlistId,
      targetEmail,
    };

    // Verifying playlist owner
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    await this._service.sendMessage('export:playlists', JSON.stringify(message));

    // Response
    const res = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });

    res.code(201);
    return res;
  }
}

module.exports = ExportsHandler;
