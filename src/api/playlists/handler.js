class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postPlaylistHandler(request, h) {
    // Validating request
    this._validator.validatePostPlaylistPayload(request.payload);

    const { name } = request.payload;
    const id = await this._service.addPlaylist({ name });

    // Response
    const res = h.response({
      status: 'success',
      data: {
        playlistId: id,
      },
    });

    res.code(201);
    return res;
  }

  async getPlaylistsHandler() {
    const playlists = await this._service.getPlaylists();

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;

    await this._service.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongIntoPlaylistHandler(request, h) {
    // Validating request
    this._validator.validatePostSongIntoPlaylistPayload(request.payload);

    const { id } = request.params;
    const { songId } = request.payload;

    await this._service.addSongIntoPlaylist(id, { songId });

    // Response
    const res = h.response({
      status: 'success',
      message: 'Berhasil menambahkan lagu kedalam playlist',
    });

    res.code(201);
    return res;
  }

  async getSongsByPlaylistIdHandler(request) {
    const { id } = request.params;

    const playlist = await this._service.getPlaylistById(id);

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongByPlaylistIdHandler(request) {
    const { id } = request.params;
    const { songId } = request.payload;

    await this._service.deleteSongByPlaylistId(id, { songId });

    return {
      status: 'success',
      message: 'Berhasil menghapus lagu di dalam playlist',
    };
  }
}

module.exports = PlaylistsHandler;
