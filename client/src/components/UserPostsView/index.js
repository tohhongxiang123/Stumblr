import React, { Component } from 'react';
import { connect } from 'react-redux';
import withPosts from '../withPosts';
import UserHeaderContainer from './UserHeaderContainer';
import './UserPostsView.css';
import UserFollowing from './UserFollowingContainer';

class UserPostsView extends Component {
    // This component renders on /user/:value, where value is the username of the user we are looking at
    render() {
        return (
            <div className="user-post-list-container">
                <UserHeaderContainer username={this.props.value}/>
                <UserFollowing username={this.props.value} />
                <div className="post-list-container">
                    {this.props.posts}
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    currentUsername: state.user.username
})

export default withPosts(connect(mapStateToProps)(UserPostsView), 'user');
