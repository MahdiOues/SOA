const fs = require('fs');
const path = require('path');
const express = require('express');
const { buildSchema } = require('graphql');
const { createHandler } = require('graphql-http/lib/use/express');

const userResolver = require('./userResolver');
const deviceResolver = require('./deviceResolver');

const app = express();
const port = 5000;

const schema = buildSchema(
  fs.readFileSync(path.join(__dirname, 'schema.gql'), 'utf8')
);

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'TP7 REST/GraphQL avec RxDB',
    rest: {
      users: {
        list: 'GET /users',
        one: 'GET /users/:id',
        create: 'POST /users',
        update: 'PUT /users/:id',
        delete: 'DELETE /users/:id'
      },
      devices: {
        list: 'GET /devices',
        one: 'GET /devices/:id',
        byUser: 'GET /users/:userId/devices',
        create: 'POST /devices',
        update: 'PUT /devices/:id',
        delete: 'DELETE /devices/:id'
      }
    },
    graphql: 'POST /graphql'
  });
});

app.all('/graphql', createHandler({
  schema,
  rootValue: {
    ...userResolver,
    ...deviceResolver
  }
}));

/* =========================
   USERS REST
========================= */

app.get('/users', async (req, res) => {
  try {
    const users = await userResolver.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const user = await userResolver.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/users', async (req, res) => {
  try {
    const created = await userResolver.createUser(req.body);
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/users/:id', async (req, res) => {
  try {
    const updated = await userResolver.editUser({
      id: req.params.id,
      ...req.body
    });

    if (!updated) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const deleted = await userResolver.removeUser(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ message: 'success' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   DEVICES REST
========================= */

app.get('/devices', async (req, res) => {
  try {
    const allDevices = await deviceResolver.getAllDevices();
    res.json(allDevices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/devices/:id', async (req, res) => {
  try {
    const device = await deviceResolver.getDeviceById(req.params.id);

    if (!device) {
      return res.status(404).json({ error: 'Device non trouvé' });
    }

    res.json(device);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/users/:userId/devices', async (req, res) => {
  try {
    const userDevices = await deviceResolver.getDevicesByUserId(req.params.userId);
    res.json(userDevices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/devices', async (req, res) => {
  try {
    const created = await deviceResolver.createDevice(req.body);
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/devices/:id', async (req, res) => {
  try {
    const updated = await deviceResolver.editDevice({
      id: req.params.id,
      ...req.body
    });

    if (!updated) {
      return res.status(404).json({ error: 'Device non trouvé' });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/devices/:id', async (req, res) => {
  try {
    const deleted = await deviceResolver.removeDevice(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Device non trouvé' });
    }

    res.json({ message: 'success' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
  console.log('GraphQL disponible sur http://localhost:5000/graphql');
});