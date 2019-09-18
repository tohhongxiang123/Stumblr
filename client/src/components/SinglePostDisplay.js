import React, { Component } from 'react';
import withPosts from './withPosts';

class SinglePostDisplay extends Component {
    render() {
        return (
            <div className="single-post-container">
                {this.props.posts}
            </div>
        )
    }
}   

export default withPosts(SinglePostDisplay, 'post');
