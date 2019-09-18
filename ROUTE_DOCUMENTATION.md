# Documentation

## API
A few types of objects will be returned. They are the following:

- ### `Post` object
    - Returns the following fields:
        - `postid` - integer
        - `posttitle` - string
        - `postcontent` - string
        - `time_edited` - timestamp with timezone
        - `postuserid` - integer
        - `postusername` - string
        - `avatar_image` - string (encoded base64 image)

- ### `User` object
    - Returns the following fields:
        - `userid` - integer
        - `username` - string
        - `email` - string
        - `avatar_image` - base64 encrypted image file

- ### `Error` object
    - Whenever an error occurs, it should return the following fields:
        - `status: "failed"`
        - `error: errorMessage`
        - `details` 

### Success handling
- On success, if it does not return a `Post` or `User` object, will return the following:
    - `status: "success"`
    - `...payload` - Necessary information that is required for that endpoint

### Private Routes
- All private routes require a cookie named `auth-token`, which contains a signed JWT obtained when logging in. 
- Without an `auth-token`, returns an `Error`

---

# `USER` ROUTES

### GET `/api/users`
- Gets all users
- Returns [`User`]
- Public

### GET `/api/users/getuser/:id`
- Gets user by `id`
- Returns `User` that matches `id`. If no user, returns `Error`
- Public

### GET `/api/users/getuser/username/:username`
- Gets user by `username`
- Returns `User` that matches `username`. If no user, returns `Error`
- Public

### POST `/api/users/register`
- Registers a user to the database
- ### Parameters 
	- Header
		- `Content-Type: application/json`
	- Body
      - `username`: at least 4 characters, must not already exist in database
      - `email`: valid email address, must not already exist in database
      - `password`: at least 6 characters
- Returns `Success` with no `payload`
- Public

### POST `/api/users/login`
- Logs in user, creating an `auth-token` cookie with user credentials (username and userid)
- #### Parameters
    - Header
		- `Content-Type: application/json`
	- Body
      - `username`: at least 4 characters
      - `password`: at least 6 characters
- Returns `Success` object with the following `payload`:
    ``` 
    {
        auth-token, 
        user: `User`
    }
    ```
- Public

### POST `api/users/logout`
- Logs user out, and clears `auth-token` cookie
- Returns `Success` object with no `payload`
- Public

### GET `api/users/currentuser`
- Gets current user
- Returns `Success` object, with payload containing `user = User`
- Private

### DELETE `api/users/delete/:id`
- Deletes current user with `id`
- Returns `Success` object with no `payload`
- Private

### PUT `/api/users/setuser/:id`
- Updates user credentials with the ones provided in body, and update `auth-token` cookie
- #### Parameters
    - Header
		- `Content-Type: application/json`
	- Body
      - `username`: at least 4 characters, must not already exist in the database, the new username for the user
      - `email`: valid email address, must not already exist in the database the new email for the user
      - `password`: at least 6 characters, must match user with `id`'s password
      - `newpassword`: at least 6 characters, the new password for the user
- Returns `Success` object with no `payload`
- Private

### GET `/api/users/following/:username`
- Gets all usernames of users being followed by `username`
- Returns `[ User ]`
- Public

### GET `/api/users/isfollowing/:username1/:username2`
- Checks whether `username1` is following `username2`
- Public

### POST `/api/users/follow/:username1/:username2`
- Makes `username1` follow `username2`
- Returns `Success` with no payload
- Private

### POST `/api/users/unfollow/:username1/:username2`
- Makes `username1` unfollow `username2`
- Returns `Success` with no payload
- Private

---

# `POST` ROUTES

### GET `/api/posts`
- Returns all posts
- Public

### GET `/api/posts/:id`
- Returns `Post` with `id`
- Returns empty array if no such `Post` exists
- Public

### GET `/api/posts/user/getbyid/:id`
- Returns `[Post]` whose author has the userid `id`
- Returns empty array if no such `User` or `Post` exists
- Public

### GET `/api/posts/user/getbyusername/:username`
- Returns all `[Post]` whose author has the username `username`
- Returns empty array if no such `username` or `Post` exists
- Public

### GET `/api/posts/search/:value`
- Returns [`Post`] whose title or username or content contains `value`
- Returns empty array if no such `Post` found
- Public

### POST `/api/posts/user/:id`
- Adds a `Post`, with the author being the user with `id`
- #### Parameters
    - Header
		- `Content-Type: application/json`
	- Body
      - `postTitle`: non-empty string
      - `postContent`: non-empty string
- Returns `Success` with payload: `{postTitle, postContent}`
- Private

### DELETE `/api/posts/:id`
- Deletes `Post` with `id`
- Private

### PUT `/api/posts/:id`
- Updates `Post` with `id`
- #### Parameters
    - Header
		- `Content-Type: application/json`
	- Body
      - `postTitle`: non-empty string
      - `postContent`: non-empty string
- Returns `Succcess` with no payload
- Private   