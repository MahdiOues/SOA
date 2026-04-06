const dbPromise = require('./db');

function toJson(doc) {
  return doc ? doc.toJSON() : null;
}

async function findUserById(usersCollection, id) {
  return usersCollection.findOne(id).exec();
}

async function findBySerialNumber(devicesCollection, serialNumber) {
  return devicesCollection.findOne({
    selector: { serialNumber }
  }).exec();
}

async function ensureUniqueSerialNumber(devicesCollection, serialNumber, excludedId = null) {
  const existing = await findBySerialNumber(devicesCollection, serialNumber);
  if (existing && existing.primary !== excludedId) {
    throw new Error('Numéro de série déjà utilisé');
  }
}

/* =========================
   SHARED BUSINESS FUNCTIONS
========================= */

async function getDeviceById(id) {
  const { devices } = await dbPromise;
  const doc = await devices.findOne(id).exec();
  return toJson(doc);
}

async function getAllDevices() {
  const { devices } = await dbPromise;
  const docs = await devices.find().exec();
  return docs.map((doc) => doc.toJSON());
}

async function getDevicesByUserId(userId) {
  const { devices } = await dbPromise;
  const docs = await devices.find({
    selector: { userId }
  }).exec();
  return docs.map((doc) => doc.toJSON());
}

async function createDevice({ userId, name, type, serialNumber, status }) {
  const { users, devices, persistDevices, createId } = await dbPromise;

  const user = await findUserById(users, userId);
  if (!user) {
    throw new Error('Utilisateur introuvable');
  }

  await ensureUniqueSerialNumber(devices, serialNumber);

  const inserted = await devices.insert({
    id: createId(),
    userId,
    name,
    type,
    serialNumber,
    status
  });

  await persistDevices();
  return inserted.toJSON();
}

async function editDevice({ id, name, type, serialNumber, status }) {
  const { devices, persistDevices } = await dbPromise;
  const doc = await devices.findOne(id).exec();

  if (!doc) {
    return null;
  }

  if (serialNumber !== undefined) {
    await ensureUniqueSerialNumber(devices, serialNumber, id);
  }

  const patchData = {};
  if (name !== undefined) patchData.name = name;
  if (type !== undefined) patchData.type = type;
  if (serialNumber !== undefined) patchData.serialNumber = serialNumber;
  if (status !== undefined) patchData.status = status;

  const updatedDoc = await doc.incrementalPatch(patchData);

  await persistDevices();
  return updatedDoc.toJSON();
}

async function removeDevice(id) {
  const { devices, persistDevices } = await dbPromise;
  const doc = await devices.findOne(id).exec();

  if (!doc) {
    return false;
  }

  await doc.remove();
  await persistDevices();
  return true;
}

async function removeDevicesByUserId(userId) {
  const { devices, persistDevices } = await dbPromise;
  const docs = await devices.find({
    selector: { userId }
  }).exec();

  for (const doc of docs) {
    await doc.remove();
  }

  await persistDevices();
}

/* =========================
   GRAPHQL RESOLVERS
========================= */

module.exports = {
  getDeviceById,
  getAllDevices,
  getDevicesByUserId,
  createDevice,
  editDevice,
  removeDevice,
  removeDevicesByUserId,

  device: async ({ id }) => {
    return getDeviceById(id);
  },

  devices: async () => {
    return getAllDevices();
  },

  devicesByUser: async ({ userId }) => {
    return getDevicesByUserId(userId);
  },

  addDevice: async ({ userId, name, type, serialNumber, status }) => {
    return createDevice({ userId, name, type, serialNumber, status });
  },

  updateDevice: async ({ id, name, type, serialNumber, status }) => {
    return editDevice({ id, name, type, serialNumber, status });
  },

  deleteDevice: async ({ id }) => {
    return removeDevice(id);
  }
};