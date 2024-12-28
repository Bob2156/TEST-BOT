const nacl = require('tweetnacl');

module.exports = (request, reply, done) => {
  const signature = request.headers['x-signature-ed25519'];
  const timestamp = request.headers['x-signature-timestamp'];
  const rawBody = JSON.stringify(request.body);

  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + rawBody),
    Buffer.from(signature, 'hex'),
    Buffer.from(process.env.DISCORD_PUBLIC_KEY, 'hex')
  );

  if (!isVerified) {
    reply.code(401).send({ error: 'Invalid request signature' });
    return;
  }

  done();
};
