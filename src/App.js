import React, { Component } from 'react';
import './App.css';
import { Map, List } from 'immutable';
import { projectState, addListener, updateState } from './State.js';
import { hoc, Stats} from './hoc.js';

function normShape(shape) {
  const {startX, endX, startY, endY} = shape;
  return {
    x: Math.min(startX, endX),
    y: Math.min(startY, endY),
    width: Math.abs(startX - endX),
    height: Math.abs(startY - endY),
    ...shape,
  }
}

function randInt(max) {
 return Math.floor(Math.random() * (max + 1));
}

function randColor() {
  return `rgba(${randInt(255)},${randInt(255)},${randInt(255)}, 0.6)`;
}


const Shape = hoc(class Shape extends Component {
  render() {
    const {x, y, width, height, color, id} = normShape(this.props.shape);
    return (
      <div
         onClick={this._changeColor}
         className="shape"
         style={{
           cursor: 'pointer',
           top: y,
           left: x,
           backgroundColor: color,
           width,
           height,
           zIndex: Math.floor(id / 100000000),
         }}>
      </div>
    );
  }
  _changeColor = () => {
    const {id} = this.props.shape;
    updateState(state => state.setIn(
      ['shapes', id],
      {...this.props.shape, color: randColor()},
    ));
  }
});

const App = hoc(class App extends Component {
  constructor(props) {
    super(props);
    this.state = {projectState};
  }

  componentDidMount() {
    this._cleanup = addListener(({newState}) => {
      this.setState({projectState: newState});
    });
    window.addEventListener('keydown', this._onKey);
  }

  componentWillUnmount() {
    this._cleanup();
  }

  render() {
    const state = this.state.projectState || Map({});
    return (
      <div
         className="App"
         onMouseDown={this._startShape}
         onMouseMove={this._changeShape}
         onMouseUp={this._endShape}>
        {this.state.stats ? <Stats/> : null}
        <div className="shapes">
          {
            state.get('shapes', Map()).valueSeq().sortBy(x => x.id).toArray().map((v) => {
              return <Shape key={v.id} shape={v}/>;
            })
          }
        </div>
        <div className="in-progress-shapes">
          {this.state.drawing ? <Shape shape={this.state}/> : null}
        </div>
      </div>
    );
  }

  _startShape = (e) => {
    this.setState({
      startX: e.pageX,
      startY: e.pageY,
      endX: e.pageX,
      endY: e.pageY,
      color: randColor(),
      id: Date.now(),
      drawing: true,
    });
  }

  _changeShape = (e) => {
    if (this.state.drawing) {
      this.setState({
        endX: e.pageX,
        endY: e.pageY,
      });
    }
  }

  _endShape = (e) => {
    if (this.state.drawing) {
      this.setState({
        drawing: false,
      });
      const {startX, startY, endX, endY, color, id} = this.state;
      updateState(state => {
        return state.setIn(['shapes', id], {
          startX,
          startY,
          endX,
          endY,
          id,
          color,
        });
      });
    }
  }

  _onKey = (e) => {
    if (e.key === 's') {
      this.setState({stats: !this.state.stats});
    }
  }
})

export default App;
