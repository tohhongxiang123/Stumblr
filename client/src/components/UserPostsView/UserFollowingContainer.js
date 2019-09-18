import React, { Component } from 'react';
import axios from 'axios';
import UserFollowing from './UserFollowing';

export default class UserFollowersContainer extends Component {
    state = {
        followers: [],
        isFetching: false,
        error: null
    }

    componentDidMount() {
        this.getFollowing();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.username !== this.props.username) {
            this.getFollowing();
        }
    }

    async getFollowing() {
        await this.setState({isFetching: true});
        const username = this.props.username || this.props.match.params.value;
        try {
            const {data} = await axios.get(`/api/users/following/${username}`);
            this.setState({
                followers: data
            })
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
    render() {
        return (
            <div className="user-following-container">
                {this.state.isFetching ? (
                    <p>Loading...</p>
                ) : (
                    <UserFollowing followers={this.state.followers}/>
                )}
            </div>
        )
    }
}
