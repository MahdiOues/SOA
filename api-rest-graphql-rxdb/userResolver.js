const dbPromise = require('./db');
const deviceResolver = require('./deviceResolver');

function toJson(doc) {
  return doc ? doc.toJSON() : null;
}

async function findByEmail(usersCollection, email) {
  return usersCollection.findOne({
    selector: { email }
  }).exec();
}

async function ensureUniqueEmail(usersCollection, email, excludedId = null) {
  const existing = await findByEmail(usersCollection, email);
  if (existing && existing.primary !== excludedId) {
    throw new Error('Adresse e-mail déjà utilisée');
  }
}

/* =========================
   SHARED BUSINESS FUNCTIONS
========================= */

async function getUserById(id) {
  const { users } = await dbPromise;
  const doc = await users.findOne(id).exec();
  return toJson(doc);
}

async function getAllUsers() {
  const { users } = await dbPromise;
  const docs = await users.find().exec();
  return docs.map((doc) => doc.toJSON());
}

async function createUser({ name, email, password }) {
  const { users, persistUsers, createId } = await dbPromise;

  await ensureUniqueEmail(users, email);

  const inserted = await users.insert({
    id: createId(),
    name,
    email,
    password
  });

  await persistUsers();
  return inserted.toJSON();
}

async function editUser({ id, name, email, password }) {
  const { users, persistUsers } = await dbPromise;
  const doc = await users.findOne(id).exec();

  if (!doc) {
    return null;
  }

  await ensureUniqueEmail(users, email, id);

  const updatedDoc = await doc.incrementalPatch({
    name,
    email,
    password
  });

  await persistUsers();
  return updatedDoc.toJSON();
}

async function removeUser(id) {
  const { users, persistUsers } = await dbPromise;
  const doc = await users.findOne(id).exec();

  if (!doc) {
    return false;
  }

  await deviceResolver.removeDevicesByUserId(id);
  await doc.remove();
  await persistUsers();
  return true;
}

/* =========================
   GRAPHQL RESOLVERS
========================= */

module.exports = {
  getUserById,
  getAllUsers,
  createUser,
  editUser,
  removeUser,

  user: async ({ id }) => {
    return getUserById(id);
  },

  users: async () => {
    return getAllUsers();
  },

  addUser: async ({ name, email, password }) => {
    return createUser({ name, email, password });
  },

  updateUser: async ({ id, name, email, password }) => {
    return editUser({ id, name, email, password });
  },

  deleteUser: async ({ id }) => {
    return removeUser(id);
  }
};