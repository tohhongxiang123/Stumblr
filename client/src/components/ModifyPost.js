import React, { Component, useState, useEffect } from 'react';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import ReactMde from 'react-mde';
import "react-mde/lib/styles/css/react-mde-all.css";
import * as Showdown from 'showdown';
import './EditPostComponents/EditPostComponents.css';

export default function ModifyPost(props) {
    const [selectedTab, setSelectedTab] = useState("write");
    const [postTitle, setPostTitle] = React.useState(props.postTitle);
    const [postContent, setPostContent] = React.useState(props.postContent);

    useEffect(() => {
        setPostTitle(props.postTitle);
        setPostContent(props.postContent);
    }, [props.postTitle, props.postContent]);

    const converter = new Showdown.Converter({
        tables: true,
        simplifiedAutoLink: true,
        strikethrough: true,
        tasklists: true
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        props.handleSubmit(postTitle, postContent)
    }

    return (
        <Jumbotron className="modify-post-container">
            <h2>{props.title}</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="postTitle">
                    <Form.Label>Post Title</Form.Label>
                    <Form.Control type="text" placeholder="Post Title" value={postTitle} onChange={(e) => setPostTitle(e.target.value)}/>
                </Form.Group>
                 <Form.Group controlId="postContent">
                    <Form.Label>Content</Form.Label>
                    <ReactMde id="postContent" 
                    textAreaProps={{placeholder:"Post Content"}}
                    value={postContent}
                    onChange={setPostContent}
                    selectedTab={selectedTab} 
                    onTabChange={setSelectedTab}
                    generateMarkdownPreview={markdown =>
                        Promise.resolve(converter.makeHtml(markdown))
                      }/>
                </Form.Group>
                {props.success ? <Alert variant="success">Post successfully added. You will be redirected momentarily...</Alert> : null}
                {props.isSubmitting ? <p>Submitting...</p> : null}
                {props.errors ? <Alert variant="danger">{props.errors}</Alert> : null}
                <Button type="submit" disabled={props.disabled}>Submit</Button>
            </Form>
        </Jumbotron>
    )
}
