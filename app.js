require('dotenv').config();

const Hapi = require('@hapi/hapi');

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

  // Executing server
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
