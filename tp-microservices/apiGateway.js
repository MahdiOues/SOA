const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express4');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');

const movieProtoPath = 'movie.proto';
const tvShowProtoPath = 'tvShow.proto';
const resolvers = require('./resolvers');
const typeDefs = fs.readFileSync('./schema.gql', 'utf8');

const app = express();

const movieProtoDefinition = protoLoader.loadSync(movieProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const tvShowProtoDefinition = protoLoader.loadSync(tvShowProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const movieProto = grpc.loadPackageDefinition(movieProtoDefinition).movie;
const tvShowProto = grpc.loadPackageDefinition(tvShowProtoDefinition).tvShow;

const server = new ApolloServer({ typeDefs, resolvers });

app.use(cors());
app.use(express.json());

server.start().then(() => {
  app.use('/graphql', expressMiddleware(server));
});

// ---------------- MOVIES REST ----------------

app.get('/movies', (req, res) => {
  const client = new movieProto.MovieService(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );

  client.searchMovies({ query: '' }, (err, response) => {
    if (err) res.status(500).send(err);
    else res.json(response.movies);
  });
});

app.get('/movies/:id', (req, res) => {
  const client = new movieProto.MovieService(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );

  client.getMovie({ movie_id: req.params.id }, (err, response) => {
    if (err) res.status(500).send(err);
    else res.json(response.movie);
  });
});

app.post('/movies', (req, res) => {
  const client = new movieProto.MovieService(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );

  const { id, title, description } = req.body;

  client.createMovie({ id, title, description }, (err, response) => {
    if (err) res.status(500).send(err);
    else res.json(response.movie);
  });
});

app.put('/movies/:id', (req, res) => {
  const client = new movieProto.MovieService(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );

  const { title, description } = req.body;

  client.updateMovie(
    { id: req.params.id, title, description },
    (err, response) => {
      if (err) res.status(500).send(err);
      else res.json(response.movie);
    }
  );
});

app.delete('/movies/:id', (req, res) => {
  const client = new movieProto.MovieService(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );

  client.deleteMovie({ id: req.params.id }, (err, response) => {
    if (err) res.status(500).send(err);
    else res.json(response);
  });
});

// ---------------- TV SHOWS REST ----------------

app.get('/tvshows', (req, res) => {
  const client = new tvShowProto.TVShowService(
    'localhost:50052',
    grpc.credentials.createInsecure()
  );

  client.searchTvshows({ query: '' }, (err, response) => {
    if (err) res.status(500).send(err);
    else res.json(response.tv_shows);
  });
});

app.get('/tvshows/:id', (req, res) => {
  const client = new tvShowProto.TVShowService(
    'localhost:50052',
    grpc.credentials.createInsecure()
  );

  client.getTvshow({ tv_show_id: req.params.id }, (err, response) => {
    if (err) res.status(500).send(err);
    else res.json(response.tv_show);
  });
});

app.post('/tvshows', (req, res) => {
  const client = new tvShowProto.TVShowService(
    'localhost:50052',
    grpc.credentials.createInsecure()
  );

  const { id, title, description } = req.body;

  client.createTvshow({ id, title, description }, (err, response) => {
    if (err) res.status(500).send(err);
    else res.json(response.tv_show);
  });
});

app.put('/tvshows/:id', (req, res) => {
  const client = new tvShowProto.TVShowService(
    'localhost:50052',
    grpc.credentials.createInsecure()
  );

  const { title, description } = req.body;

  client.updateTvshow(
    { id: req.params.id, title, description },
    (err, response) => {
      if (err) res.status(500).send(err);
      else res.json(response.tv_show);
    }
  );
});

app.delete('/tvshows/:id', (req, res) => {
  const client = new tvShowProto.TVShowService(
    'localhost:50052',
    grpc.credentials.createInsecure()
  );

  client.deleteTvshow({ id: req.params.id }, (err, response) => {
    if (err) res.status(500).send(err);
    else res.json(response);
  });
});

// Démarrer l'application
const port = 3000;
app.listen(port, () => {
  console.log(`API Gateway en cours d'exécution sur le port ${port}`);
});