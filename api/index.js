const http = require("http");
const {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} = require("discord-interactions");
const getRawBody = require("raw-body");

const PORT = process.env.PORT || 3000;

const INVITE_COMMAND = {
  name: "Invite",
  description: "Get an invite link to add the bot to your server",
};

const HI_COMMAND = {
  name: "Hi",
  description: "Say hello!",
};

const INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${process.env.APPLICATION_ID}&scope=applications.commands`;

// Create an HTTP server
const server = http.createServer(async (req, res) => {
  if (req.method === "POST") {
    try {
      // Verify the request
      const signature = req.headers["x-signature-ed25519"];
      const timestamp = req.headers["x-signature-timestamp"];
      const rawBody = await getRawBody(req);

      const isValidRequest = verifyKey(
        rawBody,
        signature,
        timestamp,
        process.env.PUBLIC_KEY
      );

      if (!isValidRequest) {
        console.error("Invalid request signature");
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Bad request signature" }));
        return;
      }

      // Parse the JSON body
      const message = JSON.parse(rawBody);

      // Handle PINGs from Discord
      if (message.type === InteractionType.PING) {
        console.log("Handling Ping request");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ type: InteractionResponseType.PONG }));
        return;
      }

      // Handle Slash Commands
      if (message.type === InteractionType.APPLICATION_COMMAND) {
        console.log(`Handling command: ${message.data.name}`);
        switch (message.data.name.toLowerCase()) {
          case HI_COMMAND.name.toLowerCase():
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                type: 4,
                data: { content: "Hello! 👋" },
              })
            );
            break;

          case INVITE_COMMAND.name.toLowerCase():
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                type: 4,
                data: {
                  content: INVITE_URL,
                  flags: 64,
                },
              })
            );
            break;

          default:
            console.error("Unknown command");
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Unknown command" }));
        }
      } else {
        console.error("Unknown interaction type");
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unknown interaction type" }));
      }
    } catch (error) {
      console.error("Error handling request:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal Server Error" }));
    }
  } else {
    // Return a 404 for any non-POST requests
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
