import React, { Component } from 'react';
import withPosts from '../withPosts';
import './QueryPostView.css';

class QueryPost extends Component {
    render() {
        console.log(this.props);
        return (
            <>
            <div className="search-header">
                <h2 className="text-center"> Search: {this.props.value} </h2>
            </div>
            <div className="post-list-container">
                {this.props.posts}
            </div>
            </>
        )
    }
}

export default withPosts(QueryPost, 'search');