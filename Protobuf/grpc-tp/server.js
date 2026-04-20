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
function sayHello(call, callback) {
const rawName = call.request?.name ?? '';
const name = String(rawName).trim() || 'inconnu';
callback(null, { message: `Bonjour, ${name} !` });
}
function main() {
const server = new grpc.Server();
server.addService(helloProto.Greeter.service, {
sayHello
});
server.bindAsync(
'0.0.0.0:50051',
grpc.ServerCredentials.createInsecure(),
(err, port) => {
if (err) {
console.error('Erreur de démarrage du serveur gRPC :', err);
return;
}
console.log(`Serveur gRPC démarré sur 0.0.0.0:${port}`);
}
);
}
main();