import React, { Component } from 'react';
import { connect } from 'react-redux';
import ModifyPost from '../ModifyPost';

import axios from 'axios';

class EditPostContainer extends Component {
    state = {
        postId: null,
        postUserId: null,
        postTitle: "",
        postContent: "",
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

        const postId = this.props.match.params.id;

        try {
            const response = await axios.get(`/api/posts/${postId}`);
            const data = response.data[0];
            
            this.setState({
                postId,
                postUserId: data.postuserid,
                postTitle: data.posttitle,
                postContent: data.postcontent
            });
        } catch(e) {
            this.setState({
                errors: e.response.data.error
            })
        }
    }

    componentWillUnmount() {
        clearTimeout(this.timeoutId);
    }

    handleSubmit = async (postTitle, postContent) => {
        // if theres no content do not post
        if (!postTitle || !postContent) {
            return this.setState({
                errors: "Please fill up all fields"
            })
        } 
        
        const payload = {postTitle: postTitle.trim(), postContent: postContent.trim()};

        // if not logged in do not edit 
        if (!this.props.currentUserId) {
            return this.setState({
                errors: "Please log in to do so"
            })
        }

        // if not the post's author, do not edit
        if (this.props.currentUserId !== this.state.postUserId) {
            return this.setState({
                errors: "You are not permitted to edit other users' posts"
            })
        }

        // if theres no content do not edit
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

            await axios.put(`/api/posts/${this.state.postId}`, payload); // add post
            this.setState({
                success: true,
                errors: null
            });

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
        return <ModifyPost {...this.props} {...this.state} title="Edit Post" handleChange={this.handleChange} handleSubmit={this.handleSubmit}/>
    }
}

const mapStateToProps = (state) => ({
    currentUserId: state.user.userId
});

export default connect(mapStateToProps)(EditPostContainer);
