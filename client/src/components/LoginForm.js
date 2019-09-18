import React, { Component } from 'react';
import { setUser } from '../actions/userActions';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Jumbotron from 'react-bootstrap/Jumbotron';
import axios from 'axios';

class LoginForm extends Component {
    state = {
        username: "",
        password: "",
        success: false,
        errors: null
    }

    componentWillUnmount() {
        clearTimeout(this.timeoutId);
    }

    handleChange = (e) => {
        this.setState({
            [e.target.id]: e.target.value
        })
    }

    handleSubmit = async (e) => {
        e.preventDefault();

        const { username, password } = this.state;

        try {
            const {data} = await axios.post('/api/users/login', {username, password}); // post data to api. if fail, move to catch
            
            this.props.setUser(data.user); // if success, set user

            this.setState({
                success: true,
                errors: null
            });

            this.timeoutId = setTimeout(() => { // redirect to index
                this.props.history.push('/');
            }, 3000);
        } catch (e) {
            console.log(e.response.data);
            const errors = e.response.data.error; // if fail, display error
            this.setState({
                errors
            })
        }
    }

    render() {
        return (
            <div className="text-center">
            <Jumbotron className="loginForm-container form-container text-left">
                <h1>Login</h1>
                <Form onSubmit={this.handleSubmit}>
                    <Form.Group controlId="username">
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="text" placeholder="Enter username" onChange={this.handleChange} value={this.state.username}/>
                    </Form.Group>

                    <Form.Group controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="Password" onChange={this.handleChange} value={this.state.password}/>
                    </Form.Group>
                    {this.state.errors ? (<Alert variant="danger">{this.state.errors}</Alert>) : null}
                    {this.state.success ? (<Alert variant="success">Logged in successfully. You will be redirected momentarily</Alert>) : null}
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </Jumbotron>
            <p>Not registered? <Link to="/register">Register</Link></p>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    username: state.user.username,
    userId: state.user.userId,
    errors: state.errors.errors
});

export default connect(mapStateToProps, { setUser })(LoginForm);
