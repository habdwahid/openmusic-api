const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlists',
    handler: (request, h) => handler.postPlaylistHandler(request, h),
    options: {
      auth: 'openmusic-api_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists',
    handler: (request) => handler.getPlaylistsHandler(request),
    options: {
      auth: 'openmusic-api_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{playlistId}',
    handler: (request) => handler.deletePlaylistByIdHandler(request),
    options: {
      auth: 'openmusic-api_jwt',
    },
  },
  {
    method: 'POST',
    path: '/playlists/{playlistId}/songs',
    handler: (request, h) => handler.postSongIntoPlaylistHandler(request, h),
    options: {
      auth: 'openmusic-api_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{playlistId}/songs',
    handler: (request) => handler.getSongsByPlaylistIdHandler(request),
    options: {
      auth: 'openmusic-api_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{playlistId}/songs',
    handler: (request) => handler.deleteSongByPlaylistIdHandler(request),
    options: {
      auth: 'openmusic-api_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{playlistId}/activities',
    handler: (request) => handler.getPlaylistActivitiesByIdHandler(request),
    options: {
      auth: 'openmusic-api_jwt',
    },
  },
];

module.exports = routes;
