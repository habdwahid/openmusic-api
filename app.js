require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const albums = require('./src/api/albums');
const authentications = require('./src/api/authentications');
const collaborations = require('./src/api/collaborations');
const playlists = require('./src/api/playlists');
const songs = require('./src/api/songs');
const users = require('./src/api/users');
const ClientError = require('./src/exceptions/ClientError');
const AlbumsService = require('./src/services/postgres/AlbumsService');
const AuthenticationsService = require('./src/services/postgres/AuthenticationsService');
const CollaborationsService = require('./src/services/postgres/CollaborationsService');
const PlaylistsService = require('./src/services/postgres/PlaylistsService');
const SongsService = require('./src/services/postgres/SongsService');
const UsersService = require('./src/services/postgres/UsersService');
const TokenManager = require('./src/tokenize/TokenManager');
const AlbumsValidator = require('./src/validator/albums');
const AuthenticationsValidator = require('./src/validator/authentications');
const CollaborationsValidator = require('./src/validator/collaborations');
const PlaylistsValidator = require('./src/validator/playlists');
const SongsValidator = require('./src/validator/songs');
const UsersValidator = require('./src/validator/users');

const init = async () => {
  const albumsService = new AlbumsService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const songsService = new SongsService();
  const usersService = new UsersService();

  // Server configuration
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    // Error handling
    if (response instanceof Error) {
      // Client error
      if (response instanceof ClientError) {
        const res = h.response({
          status: 'fail',
          message: response.message,
        });

        res.code(response.statusCode);
        return res;
      }

      if (!response.isServer) {
        return h.continue;
      }

      // Server error
      const res = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan server',
      });

      res.code(500);
      console.error(response);
      return res;
    }

    return h.continue;
  });

  await server.register({
    plugin: Jwt,
  });

  server.auth.strategy('openmusic-api_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        service: authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        songsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        service: collaborationsService,
        playlistsService,
        usersService,
        validator: CollaborationsValidator,
      },
    },
  ]);

  // Executing server
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
