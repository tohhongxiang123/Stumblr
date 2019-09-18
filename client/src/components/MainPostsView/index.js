import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import withPosts from '../withPosts';
import './MainPostsView.css';

class PostDisplay extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="post-list-container">
                {this.props.isFetching ? <p className="text-center">Fetching posts...</p> : null}
                {this.props.error ? <Alert variant="danger">{this.props.error}</Alert> : null}
                {this.props.posts}
            </div>
        )
    }
}

export default withPosts(PostDisplay);


