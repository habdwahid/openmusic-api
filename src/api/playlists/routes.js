const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlists',
    handler: (request, h) => handler.postPlaylistHandler(request, h),
  },
  {
    method: 'GET',
    path: '/playlists',
    handler: () => handler.getPlaylistsHandler(),
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}',
    handler: (request) => handler.deletePlaylistByIdHandler(request),
  },
  {
    method: 'POST',
    path: '/playlists/{id}/songs',
    handler: (request, h) => handler.postSongIntoPlaylistHandler(request, h),
  },
  {
    method: 'GET',
    path: '/playlists/{id}/songs',
    handler: (request) => handler.getSongsByPlaylistIdHandler(request),
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}/songs',
    handler: (request) => handler.deleteSongByPlaylistIdHandler(request),
  },
];

module.exports = routes;
