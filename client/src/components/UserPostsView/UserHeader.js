import React from 'react';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Alert from 'react-bootstrap/Alert';
import Image from 'react-bootstrap/Image';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

export default function UserHeader(props) {
    return (
        <Jumbotron className="user-header-container text-center">
            <div className="user-header-content">
                {props.isFetching ? (
                    <p>Loading...</p>
                ) : (
                    <>
                    <Link to={`/user/${props.username}`}>
                        <Image src={props.avatar_image} width="128px" height="128px"/>
                    </Link>
                    <h1>{props.username}</h1>
                    {props.currentUsername && props.currentUsername !== props.username ? 
                        (!props.isFollowing ? <Button onClick={props.followUser}>Follow</Button> : <Button onClick={props.unfollowUser}>Unfollow</Button>) 
                    : null}
                    </>
                )}
                {props.error && <Alert variant="danger">{props.error}</Alert>}
            </div>
        </Jumbotron>
    )
    
}
