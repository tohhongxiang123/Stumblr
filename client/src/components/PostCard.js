import React, { Component } from 'react';
import Jumbotron from 'react-bootstrap/Jumbotron';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { fetchPosts } from '../actions/postActions';
import Alert from 'react-bootstrap/Alert';
import ReactMarkDown from 'react-markdown';

class PostCard extends Component {
    render() {
        return this.props.isEmpty ? (
            <Jumbotron className="post-container">
                <Alert variant="warning">No posts found</Alert>
            </Jumbotron>
            ) : (
            <Jumbotron className="post-container">
                <h2 className="post-title"><Link to={`/post/${this.props.postid}`}>{this.props.posttitle}</Link></h2>
                <hr />
                <ReactMarkDown className="post-content" source={this.props.postcontent} linkTarget="_blank"/>
                <div className="post-footer">
                    <div className="post-footer-text">
                        <small className="d-block">Author: 
                            <Link to={`/user/${this.props.username}`}>
                                <img src={this.props.avatar_image} alt="user avatar" width="24px" height="24px" className="post-author-thumbnail"/>
                                {this.props.username}
                            </Link>
                        </small>
                        <small>
                            Last updated: {moment(this.props.time_edited).format('D MMM YYYY h:mm:ss a')}
                        </small>
                    </div>
                    {this.props.currentUserId === this.props.postuserid ? (
                        <ButtonGroup>
                            <Button variant="secondary" onClick={this.props.deletePost}>Delete</Button>
                            <Button variant="secondary" onClick={this.props.editPost}>Edit</Button>
                        </ButtonGroup>
                    ) : null}
                </div>
            </Jumbotron>
        )
    }
}

const mapStateToProps = state => ({
    currentUserId: state.user.userId
})

export default withRouter(connect(mapStateToProps, {fetchPosts})(PostCard))
