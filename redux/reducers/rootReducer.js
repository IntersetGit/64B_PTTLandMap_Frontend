import { combineReducers } from 'redux'
import userReducer from './userReducer';
import masterReducer from './masterReducer';

const rootReducer = combineReducers({
    user: userReducer,
    master: masterReducer
})

export default rootReducer;