import { SET_USER } from './types';

export const setUser = (user) => async dispatch => {
    return dispatch({
        type: SET_USER,
        payload: user
    });
}