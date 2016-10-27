import React, { Component } from 'react';
import './App.css';
import { Map, List } from 'immutable';
import { projectState, addListener, updateState } from './State.js';

class ServerRequest extends Component {
  render() {
    return (
      <div style={{marginBottom: 20}}>
        Add comment:
        <pre>
          {JSON.stringify(this.props.comment.delete('commentsBefore').toJS(), null, '\t')}
        </pre>
        <button onClick={this._onSuccess}>Succeed</button>
        {' '}
        <button onClick={this._onFail}>Fail</button>
      </div>
    );
  }

  _onFail = () => {
    const comment = this.props.comment;
    updateState(state => state.set('comments', comment.get('commentsBefore') || List()));
  }

  _onSuccess = () => {
    const comment = this.props.comment;
    updateState((state) => {
      return state.update('comments', (comments) => {
        return comments.map(c => {
          if (c === comment) {
            return c.set('optimistic', false);
          }
          return c;
        })
      })
    });
  }
}

class Comment extends Component {
  render() {
    const comment = this.props.comment;
    const mins = Math.floor((Date.now() - comment.get('timestamp')) / 1000 / 60);
    const time = mins < 1
            ? 'just now'
            : mins < 60
            ? `${mins} min${mins > 1 ? 's' : ''} ago`
            : `${Math.floor(mins / 60)} hr${Math.floor(mins / 60) > 1 ? 's' : ''} ago`

    return (
      <div style={{
        width: 250,
        textAlign: 'left',
        borderLeft: `4px solid ${comment.get('optimistic') ? 'gray' : 'green'}`,
        padding: 10,
        marginTop: 20,
      }}>
        <p style={{padding: 0, margin: 0}}>
          <span style={{
             fontSize: 12,
             marginBottom: 0,
             paddingBottom: 0,
             display: 'block',
          }}>
            {comment.get('author')} {time}
          </span>
          <br/>
          {comment.get('body')}
        </p>

      </div>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {projectState};
  }

  componentDidMount() {
    this._cleanup = addListener(({newState}) => {
      this.setState({projectState: newState});
    });
  }

  componentWillUnmount() {
    this._cleanup();
  }

  render() {
    const state = this.state.projectState || Map({});
    const comments = state.get('comments', List());
    return (
      <div className="App">
        <div className="comments">
          <div>
            <textarea rows="4" cols="50" onChange={this._onCommentChange} value={this.state.commentBody || ''}/>
            <div>
              <button onClick={this._onAddComment}>
                Add comment
              </button>
            </div>
          </div>
          {
            comments.sortBy(x => -x.get('id')).map(comment => <Comment key={comment.get('id')} comment={comment}/>)
          }
        </div>
        <div className="server">
          <h4>Server Requests</h4>
          {
            comments
              .filter(x => x.get('optimistic'))
              .sortBy(x => -x.get('id'))
              .map(comment => <ServerRequest key={comment.get('id')} comment={comment}/>)
          }
        </div>
      </div>
    );
  }

  _onCommentChange = (event) => {
    this.setState({commentBody: event.target.value});
  }

  _onAddComment = () => {
    const body = this.state.commentBody;
    if (!body) {
      return;
    }

    updateState(state => {
      return state.update('comments', List(), (c) => c.push(Map({
        body: body,
        author: 'dww',
        timestamp: Date.now(),
        id: Date.now(),
        optimistic: true,
        commentsBefore: state.get('comments'),
      })))
    });
    this.setState({commentBody: ''});
  }
}

export default App;
