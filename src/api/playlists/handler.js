class PlaylistsHandler {
  constructor(service, activitiesService, songsService, validator) {
    this._service = service;
    this._activitiesService = activitiesService;
    this._songsService = songsService;
    this._validator = validator;
  }

  async postPlaylistHandler(request, h) {
    // Validating request
    this._validator.validatePostPlaylistPayload(request.payload);

    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const id = await this._service.addPlaylist({ name, credentialId });

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

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;

    const playlists = await this._service.getPlaylists(credentialId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;

    // Verify playlist owner
    await this._service.verifyPlaylistOwner(playlistId, credentialId);

    await this._service.deletePlaylistById(playlistId);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongIntoPlaylistHandler(request, h) {
    // Validating request
    this._validator.validatePostSongintoPlaylistPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;
    const { songId } = request.payload;
    const action = 'add';

    // Verifying playlist access
    await this._service.verifyPlaylistAccess(playlistId, credentialId);

    // Verifying song
    await this._songsService.verifySongById(songId);

    await this._service.addSongIntoPlaylist(playlistId, songId);

    await this._activitiesService.addActivity({
      action, playlistId, songId, credentialId,
    });

    // Response
    const res = h.response({
      status: 'success',
      message: 'Berhasil menambahkan lagu kedalam playlist',
    });

    res.code(201);
    return res;
  }

  async getSongsByPlaylistIdHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;

    // Verifying playlist access
    await this._service.verifyPlaylistAccess(playlistId, credentialId);

    const playlist = await this._service.getSongsByPlaylistId(playlistId);

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongByPlaylistIdHandler(request) {
    // Validating request
    this._validator.validateDeleteSongFromPlaylistPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;
    const { songId } = request.payload;
    const action = 'delete';

    // Verifying playlist access
    await this._service.verifyPlaylistAccess(playlistId, credentialId);

    // Verifying song
    await this._songsService.verifySongById(songId);

    await this._service.deleteSongFromPlaylistId(songId);

    await this._activitiesService.addActivity({
      action, playlistId, songId, credentialId,
    });

    return {
      status: 'success',
      message: 'Berhasil menghapus lagu di dalam playlist',
    };
  }

  async getPlaylistActivitiesByIdHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;

    // Verifying playlist access
    await this._service.verifyPlaylistAccess(playlistId, credentialId);

    const activities = await this._activitiesService.getActivitiesByPlaylistId(playlistId);

    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }
}

module.exports = PlaylistsHandler;
