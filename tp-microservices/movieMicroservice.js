const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const movieProtoPath = 'movie.proto';
const movieProtoDefinition = protoLoader.loadSync(movieProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const movieProto = grpc.loadPackageDefinition(movieProtoDefinition).movie;

// Base de données simulée
let movies = [
  {
    id: '1',
    title: 'Inception',
    description: 'Un film de science-fiction.'
  },
  {
    id: '2',
    title: 'Interstellar',
    description: 'Un film sur l’espace.'
  }
];

const movieService = {
  getMovie: (call, callback) => {
    const movie = movies.find(m => m.id === call.request.movie_id);

    if (!movie) {
      return callback({
        code: grpc.status.NOT_FOUND,
        details: 'Film non trouvé'
      });
    }

    callback(null, { movie });
  },

  searchMovies: (call, callback) => {
    const query = (call.request.query || '').toLowerCase();

    if (!query) {
      return callback(null, { movies });
    }

    const filteredMovies = movies.filter(m =>
      m.title.toLowerCase().includes(query) ||
      m.description.toLowerCase().includes(query)
    );

    callback(null, { movies: filteredMovies });
  },

  createMovie: (call, callback) => {
    const { id, title, description } = call.request;

    const existingMovie = movies.find(m => m.id === id);
    if (existingMovie) {
      return callback({
        code: grpc.status.ALREADY_EXISTS,
        details: 'Un film avec cet id existe déjà'
      });
    }

    const newMovie = { id, title, description };
    movies.push(newMovie);

    callback(null, { movie: newMovie });
  },

  updateMovie: (call, callback) => {
    const { id, title, description } = call.request;

    const movieIndex = movies.findIndex(m => m.id === id);
    if (movieIndex === -1) {
      return callback({
        code: grpc.status.NOT_FOUND,
        details: 'Film non trouvé'
      });
    }

    movies[movieIndex] = { id, title, description };

    callback(null, { movie: movies[movieIndex] });
  },

  deleteMovie: (call, callback) => {
    const { id } = call.request;

    const movieIndex = movies.findIndex(m => m.id === id);
    if (movieIndex === -1) {
      return callback({
        code: grpc.status.NOT_FOUND,
        details: 'Film non trouvé'
      });
    }

    movies.splice(movieIndex, 1);

    callback(null, { message: 'Film supprimé avec succès' });
  },
};

const server = new grpc.Server();
server.addService(movieProto.MovieService.service, movieService);

const port = 50051;
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

console.log(`Microservice de films en cours d'exécution sur le port ${port}`);