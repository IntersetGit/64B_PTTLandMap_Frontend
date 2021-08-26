import { combineReducers } from 'redux';
import authReducer from './authReducer';


const allReducer = combineReducers({
  auth: authReducer
})

export default allReducer;