import React, { Component } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import { FaHome, FaUser, FaSearch, FaPlus } from 'react-icons/fa';
import { connect } from 'react-redux';
import { setUser } from '../actions/userActions';
import { withRouter } from 'react-router-dom';
import {NavLink} from 'react-router-dom';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Image from 'react-bootstrap/Image';

class Navigation extends Component {
    state = {
        showModal: false,
        searchPost: ""
    }

    async componentDidMount() {
        try {
            const userinforesponse = await axios.get('/api/users/currentuser');
            const { user } = userinforesponse.data;
            if (user) {
                await this.props.setUser(user);
            }
        } catch (e) {
            console.log(e.response.data);
        }
        
    }

    logOut = async () => {
        await axios.post('/api/users/logout');
        try {
            this.props.setUser({username: null, userid: null});
            this.hideModal();
            this.props.history.push('/');
        } catch (e) {
            console.log({...e});
        }
        
    }

    showModal = () => {
        this.setState({
            showModal: true
        });
    }

    hideModal = () => {
        this.setState({
            showModal: false
        });
    }

    handleChange = (e) => {
        this.setState({
            searchPost: e.target.value
        })
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.history.push(`/search/${this.state.searchPost}`);
        this.setState({
            searchPost: ""
        })
    }
 
    render() {
        return (
            <>
            <Navbar bg="dark" variant="dark" expand="lg">
            <Navbar.Brand as={NavLink} to="/">Stumblr</Navbar.Brand>
            <Form inline className="nav-search mr-auto" onSubmit={this.handleSubmit}>
                <FormControl type="text" placeholder="Search post" className="mr-sm-2" value={this.state.searchPost} onChange={this.handleChange}/>
                <Button variant="outline-success" type="submit"><FaSearch /></Button>
            </Form>

            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" className="text-right">
                <Nav className="ml-auto">
                { this.props.currentUsername ? (
                    <Nav.Link as={NavLink} to="/addpost"><FaPlus /></Nav.Link>
                ) : null}
                <Nav.Link as={NavLink} to="/" exact><FaHome /></Nav.Link>
                <NavDropdown title={<span>
                    {this.props.currentUserAvatar ? 
                    <Image width='32px' height='32px' src={this.props.currentUserAvatar} roundedCircle /> : 
                    <FaUser />}
                <small className="username-text">{this.props.currentUsername || null}</small></span>} 
                id="basic-nav-dropdown" 
                alignRight>
                    { this.props.currentUsername ? (
                        <>
                        <NavDropdown.Item as={NavLink} to={`/user/${this.props.currentUsername}`}>Your Posts</NavDropdown.Item>
                        <NavDropdown.Item as={NavLink} to="/edituser">User Details</NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item onClick={this.showModal}>Log Out</NavDropdown.Item>
                        </>
                    ) : (
                        <>
                        <NavDropdown.Item as={NavLink} to="/register">Register</NavDropdown.Item>
                        <NavDropdown.Item as={NavLink} to="/login">Log In</NavDropdown.Item>
                        </>
                    )}
                </NavDropdown>
                
                </Nav>
                
            </Navbar.Collapse>
            </Navbar>

            <Modal show={this.state.showModal} onHide={this.hideModal}>
                <Modal.Header closeButton>
                <Modal.Title>Log Out</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to log out?</Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={this.hideModal}>
                    Close
                </Button>
                <Button variant="primary" onClick={this.logOut}>
                    Log Out
                </Button>
                </Modal.Footer>
            </Modal>
            </>
        )
    }
}

const mapStateToProps = (state) => ({
    currentUsername: state.user.username,
    currentUserId: state.user.userId,
    currentUserAvatar: state.user.userAvatar
});

const mapDispatchToProps = {
    setUser
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Navigation));
