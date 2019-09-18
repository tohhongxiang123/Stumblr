import React, { Component } from 'react';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Jumbotron from 'react-bootstrap/Jumbotron';
import { Link } from 'react-router-dom';

class RegisterForm extends Component {
    state = {
        username: "",
        password: "",
        passwordAgain: "",
        email: "",
        success: false,
        error: null,
        isLoading: false
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
        const { username, password, passwordAgain, email } = this.state;

        // check if both passwords are the same
        if (password !== passwordAgain) {
            this.setState({
                error: "Passwords do not match"
            })
        } else {
            try {
                // post to api
                await this.setState({
                    error: null,
                    isLoading: true
                })
                const {data} = await axios.post('/api/users/register', {username, password, email});
    
                // success
                if (data.status === "success") {
                    this.setState({
                        error: null,
                        success: true,
                        isLoading: false
                    });

                    this.timeoutId = setTimeout(() => {
                        this.props.history.push('/login')
                    }, 3000);
                }
            } catch (e) {
                console.log(e.response.data);
                const { error } = e.response.data;
                this.setState({
                    error,
                    isLoading: false
                })
            }
        }
    }

    render() {
        return (
            <div className="text-center">
            <Jumbotron className="registerForm-container form-container text-left">
                <h1>Register</h1>
                <Form onSubmit={this.handleSubmit}>
                    <Form.Group controlId="username">
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="text" placeholder="Enter username" onChange={this.handleChange} value={this.state.username}/>
                        <Form.Text className="text-muted">At least 3 characters</Form.Text>
                    </Form.Group>

                    <Form.Group controlId="email">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control type="email" placeholder="Enter email" onChange={this.handleChange} value={this.state.email}/>
                    </Form.Group>

                    <Form.Group controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="Password" onChange={this.handleChange} value={this.state.password}/>
                        <Form.Text className="text-muted">At least 6 characters</Form.Text>
                    </Form.Group>

                    <Form.Group controlId="passwordAgain">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="Password Again" onChange={this.handleChange} value={this.state.passwordAgain}/>
                        <Form.Text className="text-muted">Enter your password again</Form.Text>
                    </Form.Group>
                    {this.state.error ? (<Alert variant="danger">{this.state.error}</Alert>) : null}
                    {this.state.isLoading ? (<p variant="secondary">Registering...</p>) : null}
                    {this.state.success ? (<Alert variant="success">Successfully registered. You will be redirected momentarily...</Alert>) : null}
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </Jumbotron>
            <p>Already registered? <Link to="/login">Log in</Link></p>
            </div>
        )
    }
}

export default RegisterForm;