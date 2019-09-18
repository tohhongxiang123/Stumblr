import { combineReducers } from 'redux';
import postReducer from './postReducer';
import userReducer from './userReducer';
import errorReducer from './errorReducer';

export default combineReducers({
    posts: postReducer,
    user: userReducer,
    errors: errorReducer
});