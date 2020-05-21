import * as Events from "../events.js";

//
// This adapter uses a shared worker to connect to the WebSocket, and
// BroadcastChannel to send events across browser windows.
// This approach is not universally implemented, most notably by Safari:
//
//   https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker/SharedWorker#Browser_compatibility
//   https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel#Browser_compatibility
//
// Down sides include neither shared workers nor broadcast channel having
// meaningful lifecycle events or even a manner of determining the number
// of active "clients" a given SharedWorker is servicing.
//
// At the moment, ESModule support is unverified, so SharedWorkers must
// effectively be self-contained; this means that there will be some
// duplication with other adapters.

export const available = window.SharedWorker && window.BroadcastChannel && true;

const channel = available && new BroadcastChannel('shared-worker');

export function monitor(server) {
  try {
    // dispatch (forward) any messages sent to the broadcast channel
    channel.onmessage = event => {
      Events.dispatch(event.data);
    }

    // start shared worker
    let worker = new SharedWorker(`../src/client/events/shared-worker.js?${server.session}`);
    worker.port.start();

    // log messages received across the port
    worker.port.onmessage = event => {
      console.log('Unexpected message received from shared worker', event.data);
    }

    // send shared worker the server information
    worker.port.postMessage({ type: 'server', server });

  } catch (error) {
    console.log("shared worker monitor error: ", error)
  }
}

// foward broadcast messages to the BroadcastChannel
export function broadcast(message) {
  channel.postMessage(message);
}