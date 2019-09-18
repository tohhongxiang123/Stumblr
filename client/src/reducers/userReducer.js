import { SET_USER, GET_FOLLOWING } from '../actions/types';

const initialState = {
    userId: null,
    username: null
}

export default function(state = initialState, action) {
    switch(action.type) {
        case SET_USER:
            return {
                ...state,
                userId: action.payload.userid,
                username: action.payload.username,
                userAvatar: action.payload.avatar_image
            }

        default:
            return state;
    }
}