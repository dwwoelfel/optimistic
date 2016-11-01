import Immutable, { Map } from 'immutable';

export var projectState = Map({});
export var listeners = Map({});

const LOCALSTORAGE_KEY = "_project_state";

function makeKeyGen() {
  var nextKey = 0;

  return {
    next: function() {
      return {value: ":" + (nextKey++).toString(36), done: false};
    }
  }
}

const _genKey = makeKeyGen();

const genKey = () => _genKey.next().value;

function notifyListeners(oldState, newState) {
  listeners.map((listener, key) => listener({oldState, newState, key}));
}

function removeListener(key) {
  listeners = listeners.delete(key);
}

export function addListener(f, key) {
  const _key = key ? key : genKey();
  listeners = listeners.set(_key, f);
  return removeListener.bind(_key);
}

export function updateState(f) {
  const oldState = projectState;
  const newState = f(oldState);
  projectState = newState;
  notifyListeners(oldState, newState);
  return newState;
}

function initState() {
  const stateStr = window.localStorage.getItem(LOCALSTORAGE_KEY);
  if (stateStr) {
    const newState = Immutable.fromJS(JSON.parse(stateStr));
    updateState(() => newState);
  }
}

function saveState() {
  window.localStorage.setItem(
    LOCALSTORAGE_KEY,
    JSON.stringify(projectState.toJS()),
  );
}

function clearState() {
  updateState(() => Immutable.Map({}));
}

window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'd') {
    clearState();
  }
});

//initState();

window.addEventListener('beforeunload', saveState);
