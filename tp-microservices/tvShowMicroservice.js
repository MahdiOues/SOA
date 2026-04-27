const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const tvShowProtoPath = 'tvShow.proto';
const tvShowProtoDefinition = protoLoader.loadSync(tvShowProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const tvShowProto = grpc.loadPackageDefinition(tvShowProtoDefinition).tvshow;

// Base de données simulée
let tvShows = [
  {
    id: '1',
    title: 'Breaking Bad',
    description: 'Une série dramatique.'
  },
  {
    id: '2',
    title: 'Dark',
    description: 'Une série mystérieuse.'
  }
];

const tvShowService = {
  getTvshow: (call, callback) => {
    const tv_show = tvShows.find(t => t.id === call.request.tv_show_id);

    if (!tv_show) {
      return callback({
        code: grpc.status.NOT_FOUND,
        details: 'Série TV non trouvée'
      });
    }

    callback(null, { tv_show });
  },

  searchTvshows: (call, callback) => {
    const query = (call.request.query || '').toLowerCase();

    if (!query) {
      return callback(null, { tv_shows: tvShows });
    }

    const filteredShows = tvShows.filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query)
    );

    callback(null, { tv_shows: filteredShows });
  },

  createTvshow: (call, callback) => {
    const { id, title, description } = call.request;

    const existingShow = tvShows.find(t => t.id === id);
    if (existingShow) {
      return callback({
        code: grpc.status.ALREADY_EXISTS,
        details: 'Une série TV avec cet id existe déjà'
      });
    }

    const newShow = { id, title, description };
    tvShows.push(newShow);

    callback(null, { tv_show: newShow });
  },

  updateTvshow: (call, callback) => {
    const { id, title, description } = call.request;

    const showIndex = tvShows.findIndex(t => t.id === id);
    if (showIndex === -1) {
      return callback({
        code: grpc.status.NOT_FOUND,
        details: 'Série TV non trouvée'
      });
    }

    tvShows[showIndex] = { id, title, description };

    callback(null, { tv_show: tvShows[showIndex] });
  },

  deleteTvshow: (call, callback) => {
    const { id } = call.request;

    const showIndex = tvShows.findIndex(t => t.id === id);
    if (showIndex === -1) {
      return callback({
        code: grpc.status.NOT_FOUND,
        details: 'Série TV non trouvée'
      });
    }

    tvShows.splice(showIndex, 1);

    callback(null, { message: 'Série TV supprimée avec succès' });
  },
};

const server = new grpc.Server();
server.addService(tvShowProto.TVShowService.service, tvShowService);

const port = 50052;
server.bindAsync(
  `0.0.0.0:${port}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error('Échec de la liaison du serveur:', err);
      return;
    }
    console.log(`Le serveur s'exécute sur le port ${port}`);
  }
);

console.log(`Microservice de séries TV en cours d'exécution sur le port ${port}`);