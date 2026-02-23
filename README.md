This project is a web application which allows uses to access data provided via web API using a front-end which incorporates AJAX requests. This also involves implementing a backend with NodeJS.


Application Description

Front-End:
- Contains a neatly styled user interface.
- Collects user input values from the form and uses them.
- Sends AJAX requests asynchronously without reloading the page.
- Receives JSON responses from the backend.
- Dynamically displays the returned data on the page.

Node.js Backend:
- Implemented using NodeJS and Express.
- Use the filename server.js for the server code, and it should run the server if the user runs node server.js from the command-line.
- Extract and use the parameters provided by the front-end request. Use these parameters to construct a request to a third-party web API. Return data to the front-end in JSON format.

Third-Party Web API Usage:
The Application uses Open-Meteo for accessing weather data (https://open-meteo.com/)

How to use this app:
- install necessary framework in cmd: npm i express axios
- under the directory where server.js file located, and use command: node server.js
- Open: http://localhost:3000/app