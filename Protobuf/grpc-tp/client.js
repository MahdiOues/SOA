'use strict';
const path = require('node:path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = path.join(__dirname, 'hello.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
keepCase: false,
longs: String,
enums: String,
defaults: true,
oneofs: true
});
const helloProto = grpc.loadPackageDefinition(packageDefinition).hello;
const client = new helloProto.Greeter(
'localhost:50051',
grpc.credentials.createInsecure()
);
client.sayHello({ name: 'TestUser' }, (err, response) => {
if (err) {
console.error('Erreur côté client :', err);
return;
}
console.log('Réponse du serveur :', response.message);
});