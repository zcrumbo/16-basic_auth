# Basic and Bearer Auth with an Express API

This app implements Basic and Bearer Auth with API endpoints to allow for user signup and sign in, and to create, read, update and delete galleries associated with that user.

# System Requirements

  - Terminal.app on macOS or equivalent
  - node.js and npm package manager installed


### Installation

Clone the repository to your local server
```sh
https://github.com/zcrumbo/16-basic_auth/tree/day-one
```

Install the dependencies -

```sh
$ npm i
```

[HTTPie](https://httpie.org/) will be required to run the HTTP requests from your terminal window. You will need to install this with [Homebrew][1] on macOS. It is also easier to see the results of all operations by running mocha tests with the command
```sh
$ mocha
```
or use the npm script to run all tests with debug
```sh
$ npm test
```
Start the server with debug

```sh
$ npm start
```
If you want to use the debug and nodemon modules, run the npm script:
```
npm start
```

### Connecting

Commands can  be sent to the api/signin and the api/signup endpoints. Once signed up, commands can be sent with the token generated during signup to api/gallery and api/gallery/:id endpoints for full CRUD functionality


```sh
$  POST /api/signup/ with JSON body {username='testname' password='password' email='email@email.com'}  #signs up for the api and returns a unqique token that must be used in future api calls

$ GET   /api/signin with basic auth header username:password #signs into the API

$ POST /api/gallery with token #creates a new gallery

$ GET /api/gallery/:galleryID with token #retrieve your gallery

$ PUT /api/gallery/:galleryID with token and JSON body {name:'galleryName', desc: 'description'} #updates specified gallery

$ DELETE /api/gallery/:galleryID with token #deletes specified gallery

```

Sending the following requests to the server will have the results below:

 * `404` response with 'not found' for unregistered endpoints and nonexistent gallery IDs
 * `401` response with 'unauthorized' for bad credentials
 * `200` response with a proper signin and gallery creation
 * `400` response with 'bad request' if no request body was provided or the body was invalid
 * `200` response with the body content for requests with valid bodies, endpoints and ids
 * `204` response for successful deletions


[1]:https://brew.sh/

