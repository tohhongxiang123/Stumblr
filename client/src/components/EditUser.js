import React, { Component } from 'react';
import axios from 'axios';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Image from 'react-bootstrap/Image';
import { connect } from 'react-redux';
import { setUser } from '../actions/userActions';

class EditUser extends Component {
    state = {
        username: "",
        email: "",
        password: "",
        newPassword: "",
        newPasswordAgain: "",
        avatarImage: null,
        avatarImageSize: null,
        success: false,
        error: null,
        isLoading: false,
        disableFields: false
    }

    async componentDidMount() {
        if (!this.props.currentUserId) {
            this.props.history.push('/');
        }

        try {
            const {data} = await axios.get(`/api/users/getuser/${this.props.currentUserId}`);
            const {username, email, avatar_image} = data;
            this.setState({
                username,
                avatarImage: avatar_image,
                email,
                disableFields: false
            });
        } catch (e) {
            this.setState({
                error: e.response.data.error
            })
        }
        
    }

    componentWillUnmount() {
        clearTimeout(this.timeoutId);
    }

    handleChange = (e) => {
        if (e.target.id === 'avatarImage') {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.readAsDataURL(file);
            reader.onload = () => {
                this.setState({
                    avatarImage: reader.result,
                    avatarImageSize: Math.round(file.size/1048576*100)/100 // convert bytes to MB
                })
            }
        } else {
            this.setState({
                [e.target.id]: e.target.value
            });
        }
        
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        let { username, email, password, newPassword, newPasswordAgain, avatarImage } = this.state;

        // new passwords do not match
        if (newPassword !== newPasswordAgain) {
            return this.setState({error: "New passwords do not match"})
        } 

        // avatar image too big
        if (this.state.avatarImageSize > 1) {
            return this.setState({error: `Avatar image too large: ${this.state.avatarImageSize} MB`})
        }

        // if newPassword is left blank, we can assume that user does not want to change password
        // handled in the backend

        try {
            await this.setState({
                isLoading: true,
                error: null
            });

            const {data} = await axios.put(`/api/users/updateuser/${this.props.currentUserId}`, {username, email, password, newPassword, avatarImage});
            console.log(data);
            this.props.setUser({
                username: username,
                userid: this.props.currentUserId,
                avatar_image: avatarImage
            })
            this.setState({
                success: true
            });
            this.timeoutId = setTimeout(() => {
                this.props.history.push('/');
            }, 3000)

        } catch (e) {
            this.setState({
                error: e.response.data.error || "Unexpected error"
            })
        } finally {
            this.setState({
                isLoading: false
            })
        }
    }

    render() {
        return (
            <div className="text-center">
            <Jumbotron className="registerForm-container form-container text-left">
                <h1>Edit User Details</h1>
                <Form onSubmit={this.handleSubmit}>
                    <Form.Group controlId="username">
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="text" placeholder="Enter username" onChange={this.handleChange} value={this.state.username} disabled={this.state.disableFields}/>
                        <Form.Text className="text-muted">At least 3 characters</Form.Text>
                    </Form.Group>

                    <Form.Group controlId="email">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control type="email" placeholder="Enter email" onChange={this.handleChange} value={this.state.email} disabled={this.state.disableFields}/>
                    </Form.Group>

                    <Form.Group controlId="avatarImage">
                        <Form.Label>Avatar Image (Maximum 1 MB)</Form.Label>
                        <Form.Control type="file" placeholder="Select image" onChange={this.handleChange} accept="image/*" disabled={this.state.disableFields}/>
                        <Image src={this.state.avatarImage} width="128px" height="128px" id="previewAvatarImage" roundedCircle/>
                        {this.state.avatarImageSize && <Form.Text className="text-muted">Current File Size: {this.state.avatarImageSize} MB</Form.Text>}
                    </Form.Group>

                    <Form.Group controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="Password" onChange={this.handleChange} value={this.state.password} disabled={this.state.disableFields}/>
                        <Form.Text className="text-muted">At least 6 characters</Form.Text>
                    </Form.Group>

                    <Form.Group controlId="newPassword">
                        <Form.Label>New Password</Form.Label>
                        <Form.Control type="password" placeholder="Password Again" onChange={this.handleChange} value={this.state.newPassword} disabled={this.state.disableFields}/>
                        <Form.Text className="text-muted">Enter your password again</Form.Text>
                    </Form.Group>

                    <Form.Group controlId="newPasswordAgain">
                        <Form.Label>New Password Again</Form.Label>
                        <Form.Control type="password" placeholder="Password Again" onChange={this.handleChange} value={this.state.newPasswordAgain} disabled={this.state.disableFields}/>
                        <Form.Text className="text-muted">Enter your password again</Form.Text>
                    </Form.Group>
                    {this.state.error ? (<Alert variant="danger">{this.state.error}</Alert>) : null}
                    {this.state.isLoading ? (<p variant="secondary">Updating user details...</p>) : null}
                    {this.state.success ? (<Alert variant="success">Successfully updated user details. You will be redirected momentarily...</Alert>) : null}
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </Jumbotron>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    currentUserId: state.user.userId,
    currentUsername: state.user.username
})

const mapDispatchToProps = {
    setUser
}

export default connect(mapStateToProps, mapDispatchToProps)(EditUser);