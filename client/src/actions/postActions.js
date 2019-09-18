import { FETCH_POSTS, DELETE_POST } from './types';
import axios from 'axios';

export const fetchPosts = (filterBy, value) => async dispatch => {
    let response;

    switch(filterBy) {
        case 'user':
            response = await axios.get(`/api/posts/user/getbyusername/${value}`);
            break;
        case 'post':
            response = await axios.get(`/api/posts/${value}`);
            break;
        case 'search':
            response = await axios.get(`/api/posts/search/${value}`);
            break;
        default:
            response = await axios.get('/api/posts');
    }

    let data = response.data;
    
    // if the data doesnt come back as an array, something went wrong
    if (!Array.isArray(data)) {
        console.log('DATA IS NOT ARRAY: ', data);
        data = []
    } 

    return dispatch({
        type: FETCH_POSTS,
        payload: data
    })
}

export const deletePost = (postid) => async dispatch => {
    console.log('REDUCER', postid);
    return dispatch({
        type: DELETE_POST,
        payload: postid
    })
    
}
