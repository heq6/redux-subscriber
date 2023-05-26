import {get} from 'object-path';

const subscribers = {};
let delimiter = '!';

export function subscribe(keys, cb) {
  const key = Array.isArray(keys) ? keys.join(delimiter) : keys;
  if (subscribers.hasOwnProperty(key)) {
    subscribers[key].push(cb);
  } else {
    subscribers[key] = [cb];
  }

  // return "unsubscribe" function
  return function nm() {
    subscribers[key] = subscribers[key].filter(s => s !== cb);
  };
}
export default function(store, defaultDelimiter = delimiter) {
  delimiter = defaultDelimiter;
  let prevState = store.getState();

  store.subscribe(() => {
    const newState = store.getState();

    Object.keys(subscribers).forEach(subscriberkey => {
      const keys = subscriberkey.split(delimiter);
      const result = [];
      let isAnyStateChanged = false;
      keys.forEach(key => {
        const keyState = get(newState, key);
        result.push(keyState);
        if (!isAnyStateChanged && get(prevState, key) !== keyState) {
          isAnyStateChanged = true;
        }
      });
      if (isAnyStateChanged) {
        if (keys.length === 1) {
          subscribers[subscriberkey].forEach(cb => cb(result[0]));
        } else {
          subscribers[subscriberkey].forEach(cb => cb(result));
        }
      }
    });
    prevState = newState;
  });

  return subscribe;
}
