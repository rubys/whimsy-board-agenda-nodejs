const bc = new BroadcastChannel('websocket');

// eslint-disable-next-line no-restricted-globals
self.addEventListener('connect', ({ ports: [port] }) => {

  port.addEventListener('message', event => {
    port.postMessage('*** ' + event.data.toUpperCase());
    bc.postMessage('>>> ' + event.data.toUpperCase())
  });

  port.start();

})
