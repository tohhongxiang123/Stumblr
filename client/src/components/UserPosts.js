import React, { Component } from 'react';
import { connect } from 'react-redux';
import PostItem from './PostItem';
import withPosts from './withPosts';

class UserPosts extends Component {
    render() {
        console.log(this.props.currentUsername === this.props.value);
        const posts = this.props.posts.map(post => (
            <PostItem key={post.postid}
            postId={post.postid} 
            posttitle={post.posttitle} 
            postcontent={post.postcontent} 
            postTime={post.time_edited}
            postuserid={post.postuserid} 
            postUsername={post.username}
            postUserAvatar={post.avatar_image}
            fetchPosts={this.props.fetchPosts}/>
        ));
        return (
            <div className="post-list-container">
                <h2>{this.props.currentUsername === this.props.value ? "Your own posts" : this.props.value}</h2>
                {posts}
            </div>
        )
    }
}

const mapStateToProps = state => ({
    currentUsername: state.user.username
})

export default withPosts(connect(mapStateToProps)(UserPosts), 'user');
