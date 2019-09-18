import React from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import Image from 'react-bootstrap/Image';
import {Link} from 'react-router-dom';

export default function UserFollowers(props) {
    let follower_list;
    if (props.followers.length > 0) {
        follower_list = props.followers.map(follower => (
        <ListGroup.Item key={follower.userid}>
            <Link to={`/user/${follower.username}`}>
                <Image src={follower.avatar_image} roundedCircle width="24px" height="24px" className="mr-2"/>{follower.username}
            </Link>
        </ListGroup.Item>));
    } else {
        follower_list = <ListGroup.Item>This User is not following anybody</ListGroup.Item>
    }

    return (
        <>
            <h3>Following</h3>
            <ListGroup variant="flush">
                {follower_list}
            </ListGroup>
        </>
    )
}
