const channel = new BroadcastChannel('shared-worker');

let server = null;
let socket = null;
let interval = null;

function broadcast(message) {
  channel.postMessage(message);
};

self.addEventListener('connect', ({ ports: [port] }) => {
  console.log('SharedWorker started');

  // wait for server info from the browser window
  port.addEventListener('message', event => {
    if (event.data.type === 'server') {
      if (event.data.server.session !== server?.session) {
        server = event.data.server;

        if (!server.offline) {
          connectToServer(server);

          if (interval) clearInterval(interval);

          interval = setInterval(
            () => { if (!socket) connectToServer(server) },
            (server.env === 'development' ? 500 : 25_000)
          )
        }
      }

      if (server.offline) {
        if (interval) clearInterval(interval);
        interval = null;

        if (socket) socket.close();
        socket = null;
      }
    } else {
      console.warn("unexpected shared worker message received: ", event)
    }
  });

  port.start();
})

// establish a connection to the server
function connectToServer({ websocket, session }) {
  try {
    if (socket) return;
    socket = new WebSocket(websocket);

    socket.onopen = (event) => {
      socket.send(`session: ${session}\n\n`);
      console.log("WebSocket connection established");
    };

    socket.onmessage = (event) => {
      broadcast(event.data);
    };

    socket.onerror = (event) => {
      if (socket) console.log("WebSocket connection terminated");
      socket = null
    };

    socket.onclose = (event) => {
      if (socket) console.log("WebSocket connection terminated");
      socket = null
    }
  } catch (e) {
    console.log(e)
  }
};