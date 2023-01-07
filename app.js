require('dotenv').config();

const Hapi = require('@hapi/hapi');
const albums = require('./src/api/albums');
const songs = require('./src/api/songs');
const ClientError = require('./src/exceptions/ClientError');
const AlbumsService = require('./src/services/postgres/AlbumsService');
const SongsService = require('./src/services/postgres/SongsService');
const AlbumsValidator = require('./src/validator/albums');
const SongsValidator = require('./src/validator/songs');

const init = async () => {
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

  await server.register([
    {
      plugin: songs,
      options: {
        service: new SongsService(),
        validator: SongsValidator,
      },
    },
    {
      plugin: albums,
      options: {
        service: new AlbumsService(),
        validator: AlbumsValidator,
      },
    },
  ]);

  // Executing server
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
