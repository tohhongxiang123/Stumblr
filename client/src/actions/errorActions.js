import { CLEAR_ERRORS, SET_ERROR } from './types';

export const clearErrors = () => dispatch => {
    console.log('clear errors');
    return dispatch({
        type: CLEAR_ERRORS
    })
}

export const setError = (error) => dispatch => {
    return dispatch({
        type: SET_ERROR,
        payload: error
    })
}
