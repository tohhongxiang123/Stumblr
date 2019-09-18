import React from 'react';
import './App.css';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import store from './store';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navigation from './components/Navigation';
import EditUser from './components/EditUser';
import MainPostsView from './components/MainPostsView';
import UserPostsView from './components/UserPostsView';
import EditPostContainer from './components/EditPostComponents/EditPostContainer';
import AddPostContainer from './components/EditPostComponents/AddPostContainer';
import SinglePostDisplay from './components/SinglePostDisplay';
import QueryPostView from './components/QueryPostView';
import UserFollowingContainer from './components/UserPostsView/UserFollowingContainer';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Navigation />
        <Switch>
          <Route path="/" exact component={MainPostsView} />
          <Route path="/login" component={LoginForm} />
          <Route path="/register" component={RegisterForm} />
          <Route path="/addpost" component={AddPostContainer} />
          <Route path="/editpost/:id" component={EditPostContainer} />
          <Route path="/edituser" component={EditUser} />
          <Route path="/user/:value" component={UserPostsView} />
          <Route path="/post/:value" component={SinglePostDisplay} />
          <Route path="/search/:value" component={QueryPostView} />
        </Switch>
      </Router>
    </Provider>
    
  );
}

export default App;
