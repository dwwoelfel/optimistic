import {Map, List} from 'immutable';
import React from 'react';

var stats = Map({});

function sum(xs) {
  return xs.reduce((acc, x) => acc + x, 0, xs);
}

function avg(xs) {
  if (xs.count() === 0) {
    return 0;
  }
  return sum(xs) / xs.count();
}

export function hoc(C) {
  return class HOC extends React.Component {

    _willMountTs = null;
    _willUpdateTs = null;
    componentWillMount() {
      this._willMountTs = performance.now();
    }
    componentWillUpdate() {
      this._willUpdateTs = performance.now();
    }
    componentDidMount() {
      const thisStats = stats.get(C.name, Map());
      const ts = performance.now() - this._willMountTs;
      stats = stats
        .setIn([C.name, 'mount-count'], thisStats.get('mount-count', 0) + 1)
        .setIn([C.name, 'mount-ms'], thisStats.get('mount-ms', List()).push(ts));
    }

    componentDidUpdate() {
      const thisStats = stats.get(C.name);
      const ts = performance.now() - this._willUpdateTs;
      stats = stats
        .setIn([C.name, 'update-count'], thisStats.get('update-count', 0) + 1)
        .setIn([C.name, 'update-ms'], thisStats.get('update-ms', List()).push(ts));
    }

    render() {
      return <C {...this.props}/>;
    }
  }
}

export class Stats extends React.Component {
  render() {
    return (
      <div className="stats">
        <table>

          <thead>
            <tr>
              <th>Component</th>
              <th>Render/Mount</th>
              <th>Last ms</th>
              <th>Average ms</th>
              <th>Max ms</th>
              <th>Min ms</th>
              <th>Total ms</th>
            </tr>
          </thead>
          <tbody>
            {
              stats.map((v, k) => this._renderStats(k, v)).toArray()
            }
          </tbody>
        </table>
      </div>
    );
  }

  _leftRight(l, r) {
    return (
      <span className="left-right">
        <span className="left">
          {l && l.toFixed(2)}
        </span>
        <span className="right">
          {r && r.toFixed(2)}
        </span>
      </span>
    )
  }

  _renderStats(name, stats) {
    console.log(stats);
    const mountMs = stats.get('mount-ms', List());
    const updateMs = stats.get('update-ms', List());

    return (
      <tr>
        <td>{name}</td>
        <td>{this._leftRight(stats.get('mount-count'), stats.get('update-count'))}</td>
        <td>{this._leftRight(mountMs.last(), updateMs.last())}</td>
        <td>{this._leftRight(avg(mountMs), avg(updateMs))}</td>
        <td>{this._leftRight(mountMs.max(), updateMs.max())}</td>
        <td>{this._leftRight(mountMs.min(), updateMs.min())}</td>
        <td>{this._leftRight(sum(mountMs), sum(updateMs))}</td>
      </tr>
    );
  }
}
