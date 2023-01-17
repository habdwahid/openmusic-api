class AlbumsHandler {
  constructor(service, storageService, validator) {
    this._service = service;
    this._storageService = storageService;
    this._validator = validator;
  }

  async postAlbumHandler(request, h) {
    // Validating request
    this._validator.validateAlbumPayload(request.payload);

    const { name, year, coverUrl = null } = request.payload;

    const album = await this._service.addAlbum({ name, year, coverUrl });

    // Response
    const res = h.response({
      status: 'success',
      data: {
        albumId: album,
      },
    });

    res.code(201);
    return res;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;

    const album = await this._service.getAlbumById(id);

    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    // Validating request
    this._validator.validateAlbumPayload(request.payload);

    const { id } = request.params;
    const { name, year } = request.payload;

    await this._service.editAlbumById(id, { name, year });

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;

    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postAlbumCoverHandler(request, h) {
    const { id: albumId } = request.params;
    const { cover } = request.payload;

    // Validating request
    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const path = `http://${process.env.HOST}:${process.env.PORT}/albums/images/${filename}`;

    await this._service.updateAlbumCover(albumId, { path });

    // Response
    const res = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });

    res.code(201);
    return res;
  }

  async postAlbumLikeHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { albumId } = request.params;

    // Verifying album id
    await this._service.verifyAlbumById(albumId);

    const message = await this._service.checkAlbumLikes(albumId, credentialId);

    // Response
    const res = h.response({
      status: 'success',
      message,
    });

    res.code(201);
    return res;
  }

  async getAlbumLikesHandler(request, h) {
    const { albumId } = request.params;

    // Verify album id
    await this._service.verifyAlbumById(albumId);

    const { likes, cached } = await this._service.getAlbumLikes(albumId);

    // Response
    const res = h.response({
      status: 'success',
      data: {
        likes,
      },
    });

    if (cached) res.header('X-Data-Source', 'cache');
    return res;
  }
}

module.exports = AlbumsHandler;
