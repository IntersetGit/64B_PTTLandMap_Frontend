import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import { createWrapper } from 'next-redux-wrapper';
import rootReducers from './reducers/rootReducer';

const middleware = [thunk];
const composeEnhancers = typeof window != 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const makeStore = () => createStore(rootReducers, composeEnhancers(applyMiddleware(...middleware)))

export const wrapper = createWrapper(makeStore)