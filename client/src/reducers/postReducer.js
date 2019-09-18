import { FETCH_POSTS, DELETE_POST } from '../actions/types';

const initialState = {
    items: []
}

export default function(state = initialState, action) {
    switch(action.type) {
        case FETCH_POSTS:
            return {
                ...state,
                items: action.payload
            }

        case DELETE_POST:
            return {
                ...state,
                items: state.items.filter(item => item.postid !== action.payload)
            }
        default:
            return state;
    }
}