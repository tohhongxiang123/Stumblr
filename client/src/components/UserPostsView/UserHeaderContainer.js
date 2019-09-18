import React, { Component } from 'react';
import axios from 'axios';
import UserHeader from './UserHeader';
import { connect } from 'react-redux';

class UserHeaderContainer extends Component {
    state = {
        username: "",
        userid : "",
        email: "",
        avatar_image: null,
        isFetching: false,
        isFollowing: true,
        error: null
    }

    async componentDidMount() {
        this.fetchUser();
    }

    async componentDidUpdate(prevProps) {
        if (prevProps.username !== this.props.username || prevProps.currentUsername !== this.props.currentUsername) {
            this.fetchUser();
        }
    }

    fetchUser = async () => {
        await this.setState({isFetching: true});
        
        try {
            const userinforesponse = axios.get(`/api/users/getuser/username/${this.props.username}`); // get user info
            const isFollowingresponse = axios.get(`/api/users/isfollowing/${this.props.currentUsername}/${this.props.username}`); // check whether current user is following this user
            const [{data: {username, userid, email, avatar_image}}, {data: {isFollowing}}] = await Promise.all([userinforesponse, isFollowingresponse]); // welcome to object destructuring
            
            this.setState({
                username,
                userid,
                email,
                avatar_image,
                isFollowing
            });
        } catch(e) {
            this.setState({
                error: e.response.data.error
            })
        } finally {
            this.setState({
                isFetching: false
            })
        }
    }

    followUser = async () => {
        try {
            await axios.post(`/api/users/follow/${this.props.currentUsername}/${this.props.username}`);
            this.setState({
                isFollowing: true
            });
        } catch(e) {
            this.setState({
                error: e.response.data.error
            })
        }
    }

    unfollowUser = async () => {
        try {
            await axios.post(`/api/users/unfollow/${this.props.currentUsername}/${this.props.username}`);
            this.setState({
                isFollowing: false
            });
        } catch(e) {
            this.setState({
                error: e.response.data.error
            })
        }
    }

    render() {
        return (
            <UserHeader {...this.props} {...this.state} followUser={this.followUser} unfollowUser={this.unfollowUser} />
        )
    }
}

const mapStateToProps = state => ({
    currentUsername: state.user.username
})

export default connect(mapStateToProps)(UserHeaderContainer);
