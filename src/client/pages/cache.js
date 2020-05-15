import { Link } from "react-router-dom";
import JsonTree from 'react-json-tree';
import { theme } from "./store.js";
import React from "react";
import { connect } from 'react-redux';

function mapStateToProps(state) {
  return {
    digests: state.server.digests
  }
};

//
// A page showing status of caches and service workers
//
class CacheStatus extends React.Component {
  static get buttons() {
    return [{ button: ClearCache }, { button: UnregisterWorker }]
  };

  state = { cache: [], registrations: [] };

  render() {
    return <div className="container">
      <h2>Status</h2>
      {typeof navigator !== 'undefined' && "serviceWorker" in navigator ? <p>Service workers ARE supported by this browser</p> : <p>Service workers are NOT supported by this browser</p>}

      <h2>Client Cache</h2>

      {this.state.cache.length === 0 ? <p>empty</p> : <ul>
        {this.state.cache.map(item => {
          let basename = item.split("/api/").pop();
          if (basename === "") basename = "index.html";
          if (basename === "bootstrap.html") basename = item.split("/")[item.split("/").length - 2] + ".html";

          return <li key={basename}><Link to={`/cache/client/${basename}`}>{item}</Link></li>
        })}
      </ul>}

      <h2>Server Cache</h2>

      {Object.keys(this.props.digests).length === 0 ? <p>empty</p> : <ul>
        {Object.keys(this.props.digests).map(item => (
          <li key={item}><Link to={`/cache/server/${item}`}>{item}</Link></li>
        ))}
      </ul>}

      <h2>Service Workers</h2>

      {this.state.registrations.length === 0 ? <p>none found</p> : <table className="table">
        <thead>
          <th>URL</th>
          <th>Scope</th>
          <th>Status</th>
        </thead>

        <tbody>
          {this.state.registrations.map(registration =>
            <tr>
              <td>{registration.active ? <a href={registration.active.scriptURL}>{registration.active.scriptURL}</a> : null}</td>

              <td>
                <a href={registration.scope}>{registration.scope}</a>
              </td>

              <td>{registration.installing ? <span>installing</span> : registration.waiting ? <span>waiting</span> : registration.active ? <span>active</span> : <span>unknown</span>}</td>
            </tr>
          )}
        </tbody>
      </table>}
    </div>
  };

  // update information
  collect_data = () => {
    if (typeof caches !== 'undefined') {
      caches.open("board/agenda").then(cache => (
        cache.matchAll().then((responses) => {
          let cache = responses.map(response => response.url);
          cache.sort();
          this.setState({ cache: cache })
        })
      ));

      navigator.serviceWorker.getRegistrations().then(registrations => (
        this.setState({ registrations: registrations })
      ))
    }
  };

  componentDidMount() {
    // initial observations
    this.collect_data();

    // update observations every 5 seconds
    CacheStatus.timer = setInterval(() => this.collect_data(), 5000);

    // export method to allow update in response to button presses
    CacheStatus.collect_data = this.collect_data
  };

  componentWillUnmount() {
    if (CacheStatus.timer) clearInterval(CacheStatus.timer);
    CacheStatus.timer = null
  }
};

//
// A button that clear the cache
//
class ClearCache extends React.Component {
  render() {
    return <button className="btn-primary btn" onClick={this.click}>Clear Client Cache</button>
  };

  click = event => {
    if (typeof caches !== 'undefined') {
      caches.delete("board/agenda").then(status => CacheStatus.collect_data())
    }
  }
};

//
// A button that removes the service worker.  Sadly, it doesn't seem to have
// any affect on the list of registrations that is dynamically returned.
//
class UnregisterWorker extends React.Component {
  render() {
    return <button className="btn-primary btn" onClick={this.click}>Unregister ServiceWorker</button>
  };

  click = (event) => {
    if (typeof caches !== 'undefined') {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        let base = new URL("..", document.getElementsByTagName("base")[0].href).href;

        for (let registration of registrations) {
          if (registration.scope === base) {
            registration.unregister().then(status => CacheStatus.collect_data())
          }
        }
      })
    }
  }
};

//
// Individual Cache page - client
//
export class CacheClientPage extends React.Component {
  state = { response: {}, text: "" };

  render() {
    let keys = [];
    let contentType = 'text/plain';

    if (this.state.response.headers) {
      for (let [key,] of this.state.response.headers) {
        if (key !== "status") keys.push(key);
      };

      keys.sort()

      contentType = this.state.response.headers.get('Content-Type') || contentType;
    };

    let content = this.state.text;

    try {
      if (contentType.includes('json')) {
        content = JSON.parse(content);
      }
    } catch {
    }

    return <div className="container">
      <h4>{this.state.response.url}</h4>
      
      <p>{`${this.state.response.status} ${this.state.response.statusText}`}</p>

      {
        this.state.response.headers ?
          <ul>{keys.map(key => (
            <li key={key}><tt>{`${key}: ${this.state.response.headers.get(key)}`}</tt></li>
          ))}</ul>
          : null
      }

      {typeof content === "object"
        ? <JsonTree data={JSON.parse(this.state.text)} sortObjectKeys={true} hideRoot={true} theme={theme} invertTheme={false} />
        : <pre>{this.state.text}</pre>
      }
    </div>
  };

  // update on first update
  componentDidMount() {
    if (typeof caches !== 'undefined') {
      let basename = this.props.page;
      if (basename === "index.html") basename = "";
      if (/^\d+-\d+-\d+\.html$/m.test(basename)) basename = "bootstrap.html";

      caches.open("board/agenda").then(cache => (
        cache.matchAll().then((responses) => {
          for (let response of responses) {
            if (response.url.split("/api/").pop() === basename) {
              this.setState({ response: response });
              response.text().then(text => this.setState({ text: text }))
            }
          }
        })
      ))
    }
  }
};

//
// Individual Cache page - server
//
class _CacheServerPage extends React.Component {
  static mapStateToProps(state, props) {
    return {
      digest: state.server.digests[props.page]
    };
  };

  state = {contents: {status: "loading..."}};

  render() {
    return <div className="container">
      <h2>{this.props.page}</h2>

      <p>Digest: <code>{this.props.digest}</code></p>

      <JsonTree data={this.state.contents} sortObjectKeys={true} hideRoot={true} theme={theme} invertTheme={false} />
    </div>
  };

  componentDidMount() {
    this.download();
  }

  componentDidUpdate(prevProps) {
    if (this.props.digest !== prevProps.digest) this.download();
  }

  download = async () => {
    let response = await fetch(`/api/cache/${this.props.page}`);
    this.setState({ contents: await response.json() });
  }
};

export const CacheServerPage = connect(_CacheServerPage.mapStateToProps)(_CacheServerPage);

export default connect(mapStateToProps)(CacheStatus)
