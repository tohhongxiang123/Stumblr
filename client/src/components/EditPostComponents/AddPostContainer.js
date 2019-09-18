import React, { Component } from 'react';
import { connect } from 'react-redux';
import ModifyPost from '../ModifyPost';

import axios from 'axios';

class AddPostContainer extends Component {
    state = {
        success: false,
        errors: null,
        disabled: false,
        isSubmitting: false
    }

    async componentDidMount() {
        // if user is not logged in, redirect to index
        if (!this.props.currentUserId) {
            this.props.history.push('/');
        }
    }

    componentWillUnmount() {
        clearTimeout(this.timeoutId);
    }

    handleSubmit = async (postTitle, postContent) => {
        const currentUserId = this.props.currentUserId;

        // if theres no content do not post
        if (!postTitle || !postContent) {
            return this.setState({
                errors: "Please fill up all fields"
            })
        } 

        const payload = {postTitle: postTitle.trim(), postContent: postContent.trim()};

        // if not logged in do not post
        if (!this.props.currentUserId) {
            return this.setState({
                errors: "Please log in to do so"
            })
        }

        // if theres no content do not post
        if (!payload.postTitle.length > 0 || !payload.postContent.length > 0) {
            return this.setState({
                errors: "Please fill up all fields"
            })
        } 

        try {
            await this.setState({
                disabled: true,
                isSubmitting: true
            });

            await axios.post(`/api/posts/user/${currentUserId}`, payload); // add post
            this.setState({
                success: true,
                errors: null
            })
            this.timeoutId = setTimeout(() => {
                this.props.history.push('/');
            }, 3000);
        } catch(e) {
            console.log(e.response.data);
            const errors = e.response.data.error;
            this.setState({
                errors,
                disabled: false
            });
        } finally {
            this.setState({
                isSubmitting: false
            })
        }
    }

    render() {
        return <ModifyPost {...this.props} {...this.state} title="Add New Post" handleChange={this.handleChange} handleSubmit={this.handleSubmit}/>
    }
}

const mapStateToProps = (state) => ({
    currentUserId: state.user.userId
});

export default connect(mapStateToProps)(AddPostContainer);
