import {get} from 'object-path';

const subscribers = {};

export function subscribe(key, cb) {
  if (subscribers.hasOwnProperty(key)) {
    subscribers[key].push(cb);
  } else {
    subscribers[key] = [cb];
  }

  // return "unsubscribe" function
  return function sub() {
    subscribers[key] = subscribers[key].filter(s => s !== cb);
  };
}

export default function(store) {
  store.subscribe(() => {
    const newState = store.getState();

    Object.keys(subscribers).forEach(key => {
      const state = get(newState, key);
      if (state) {
        subscribers[key].forEach(cb => cb(state));
      }
    });
  });

  return subscribe;
}
