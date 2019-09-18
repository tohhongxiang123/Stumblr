import { CLEAR_ERRORS, SET_ERROR } from '../actions/types';

const initialState = {
    errors: null
}

export default function(state=initialState, action) {
    switch(action.type) {
        case CLEAR_ERRORS:
            return {
                ...state,
                errors: null
            }

        case SET_ERROR: 
            return {
                ...state,
                errors: action.payload
            }

        default:
            return state
    }
}