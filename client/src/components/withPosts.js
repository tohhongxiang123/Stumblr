import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchPosts, deletePost } from '../actions/postActions';
import PostCard from './PostCard';
import axios from 'axios';
import { stringify } from 'querystring';

export default function withPosts(WrappedComponent, filterBy=null) {
    return connect(mapStateToProps, {fetchPosts, deletePost})(class extends Component {
        constructor(props) {
            super(props);
            this.state = {
                isFetching: false,
                error: null
            }
        }
    
        componentDidMount() {
            this.fetchPosts(filterBy, this.props.match.params.value);
        }

        fetchPosts = async (filterBy, value) => {
            this.setState({isFetching: true});
            try {
                await this.props.fetchPosts(filterBy, value);
            } catch(e) {
                this.setState({error: e.response.data.error})
            } finally {
                this.setState({isFetching: false});
            }
        }

        deletePost = async (postid) => {
            console.log(postid);
            try {
                await axios.delete(`/api/posts/${postid}`);
                this.props.deletePost(postid);
                this.fetchPosts(filterBy, this.props.match.params.value);
            } catch(e) {
                console.log(e.response.data.error);
                this.setState({error: e.response.data.error})
            } finally {
                this.setState({isFetching: false});
            }
        }

        editPost = (postid) => {
            this.props.history.push(`/editpost/${postid}`);
        }
    
        componentDidUpdate(prevProps) {
            if (prevProps.match.params.value !== this.props.match.params.value) {
                this.fetchPosts(filterBy, this.props.match.params.value);
            };
        }
    
        render() {
            let posts = this.props.posts.map(post => (
                <PostCard key={post.postid}
                {...post}
                filterBy={filterBy}
                value={this.props.match.params.value}
                deletePost={() => this.deletePost(post.postid)}
                editPost={() => this.editPost(post.postid)}
                fetchPosts={this.props.fetchPosts}
                isEmpty={false}/>
            ));

            // if no posts exist and we already finshed fetching
            if (posts.length <= 0 && !this.state.isFetching) {
                posts = <PostCard isEmpty={true} />
            }

            return (
                <WrappedComponent 
                posts={posts} 
                filterBy={filterBy}
                value={this.props.match.params.value} 
                isFetching={this.state.isFetching} 
                error={this.state.error}/>
            )
        }
    }
    )
}

const mapStateToProps = state => ({
    posts: state.posts.items
});
