class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postSongHandler(request, h) {
    // Validating request
    this._validator.validateSongPayload(request.payload);

    const {
      title, year, genre, performer, duration = null, albumId = null,
    } = request.payload;

    const song = await this._service.addSong({
      title, year, genre, performer, duration, albumId,
    });

    // Response
    const res = h.response({
      status: 'success',
      data: {
        songId: song,
      },
    });

    res.code(201);
    return res;
  }

  async getSongsHandler(request) {
    const { title, performer } = request.query;

    const songs = await this._service.getSongs({ title, performer });

    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(request) {
    const { id } = request.params;

    const song = await this._service.getSongById(id);

    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(request) {
    // Validating request
    this._validator.validateSongPayload(request.payload);

    const { id } = request.params;
    const {
      title, year, genre, performer, duration = null, albumId = null,
    } = request.payload;

    await this._service.editSongById(id, {
      title, year, genre, performer, duration, albumId,
    });

    return {
      status: 'success',
      message: 'Lagu berhasil diperbarui',
    };
  }

  async deleteSongByIdHandler(request) {
    const { id } = request.params;

    await this._service.deleteSongById(id);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
