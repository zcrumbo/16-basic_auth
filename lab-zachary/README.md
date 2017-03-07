# Basic Auth with an Express API

This app implements Basic Auth with API endpoints to allow for user signup and sign in.

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

If you are using HTTPie, in your terminal window, type the following commands, where '3000' would be replaced with your local environment PORT variable, if configured. Commands can  be sent to the api/signin and the api/signup endpoints.


```sh
$  http POST localhost:3000/api/signup/ username='testname' password='password' email='email@email.com'  #signs up for the api and returns a unqique token that must be used in future api calls

$ http GET -a username:password localhost:3000/api/signin #signs into the API

```

Sending the following requests to the server will have the results below:

 * `GET, POST`:  404 response with 'not found' for unregistered endpoints
* `GET`: 401 response with a bad credentials
 * `GET`: 200 response with a proper signin
 * `POST`: 400 response with 'bad request' if no request body was provided or the body was invalid
 * `POST`: 200 response with the body content for a post request with a valid body


[1]:https://brew.sh/

