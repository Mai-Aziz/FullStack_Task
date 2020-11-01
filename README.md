# FullStack_Task
## Enviroment
*npm init

* npm install express

* npm install knex

* npm install objection // ORM for modeling

* npm install pg // database 

* npm install express-session //used with cookie for authentication

* npm install body-parser

* npm install cookie-parser

* npm install -g nodemon

## Project Folders/Files

### db folder
#### migration folder
##### create_user_table  used to create table  with coulms insted of writing raw sql queries
##### seed  used to seed your table in the database with new values

### model folder
##### User.js   user model created using objection ORM to get table name as in the database

### views folder
##### register.js signup page 
##### login.js  login page require email and password
##### dashboard.js  html page that is user redirected to when loggin in

#### knexfile.js  where connection to the datbase is made, in our case knexfile connect to postgres database

#### app.js  where all the magic is 
##### app.js contain each api end point for each operation in the app // must held this way for session and cookie // its seems in that easy to get session info from route to another 
##### app.js held session and cookie so only logged in user can do :
###### retrive all users 
###### retrive user by ID 
###### add new user 
###### update user 
###### delete user 
##### these API ends point can user use them only in dashboard // a logged out user can not redirect to the API end points
#### all operations were done by using JSON res and HTTP code res 

# check it out :)

