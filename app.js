let express = require('express');
let port = process.env.PORT || 8001;
var bcrypt = require('bcrypt');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express()
var path = require('path');

const User = require('./models/User');

// initialize body parser 
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.urlencoded({ extended: true })); 

//express-validator
const { body, validationResult } = require('express-validator');

// initialize cookie 
app.use(cookieParser());

// initialize sisson 
app.use(session({
  key: 'user_sid',
  secret: 'somerandonstuffs',
  resave: false,
  saveUninitialized: false,
  cookie: {
      expires: 600000
  }
}));

// logout user when the app stops
app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
      res.clearCookie('user_sid');        
  }
  next();
});

//prevent user from browse back to dashboard
app.use(function(req, res, next) {
  if (!req.user)
      res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  next();
});

//session checking
var sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
      res.redirect('/dashboard');
  } else {
      next();
  }    
};


//this when you are not loged in will direct you to login page 
app.get('/', sessionChecker, (req, res) => {
  res.sendFile(path.join(__dirname + '/views/login.html'));
});

//signup GET
app.get('/signup',sessionChecker,(req, res) => {
  res.sendFile(path.join(__dirname + '/views/register.html'));
})

//signup POST
app.post('/signup',[body('password').isLength({ min: 5 })]
,(req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json('password is less than 5 ')

  } else {
    User.query().findOne({ 
      email: req.body.email})
      .then (function(user) {
        if(user) {
          return res.status(406).json("the Email you entered is used. please choose another name ")
        } else {
          User.query().insert({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  }).then( user => {
    req.session.user= user;
    res.redirect('/dashboard')
  })
  .catch( error => {
    res.redirect('/register')
        })
      }
    }
  )}
})


//login GET

app.get('/signin',sessionChecker ,(req, res) =>{
  res.sendFile(path.join(__dirname + '/views/login.html'));
});

//login POST
app.post('/signin',(req, res) => {

const salt = bcrypt.genSaltSync();
var useremail= req.body.email;
var password = req.body.password;

User.query().findOne({ 
  email: useremail } )
  .then (function(user) {

  if(!user) {
    res.status(400).json('User not found check the USER email again ')
  } else {
    user.password = bcrypt.hashSync(user.password, salt);
   if (!bcrypt.compareSync(password, user.password)) {
    res.status(401).json('wrong password could not log in')}
   else {
    req.session.user= user;
    res.redirect('/dashboard')
      }
    }
  })
});

 //dashboard GET (authenticated)
app.get('/dashboard', (req, res) => {
  if(req.session.user && req.cookies.user_sid) {
    res.sendFile(path.join(__dirname + '/views/dashboard.html'));
  } else {
    res.redirect('/signin')
  }
});

//authenticated API endpoints

//response with all users
app.get('/users', (req, res) => {
  if(req.session.user && req.cookies.user_sid){
    User.query()
      .then(users => {
          res.status(200).json(users)
      })
  } else {
    res.status('403').json('can not load users table, you should login first')
  }
  
})

//response user by ID  POST
app.post('/findbyID', (req, res) => {
  if(req.session.user && req.cookies.user_sid) {
    const id = parseInt(req.body.id)
  User.query()
      .findById(id)
      .then(function(foundUser) {

        if(foundUser) {
          res.status(200).json(foundUser)
     } else {
      res.status(404).json('user unfound')
     }
    })
  }
     else {
        res.status(403).json('can not load user, you should login first')
      }
  
})

//response user by ID  GET
app.get('/findbyID', (req, res) => {
  if(req.session.user && req.cookies.user_sid) {
    res.sendFile(path.join(__dirname + '/views/dashboard.html'));
  } else {
    res.status(403).json('cant get to find USER byID must login')
  }
});

//adding user POST 
app.post('/adduser',[body('password').isLength({ min: 5 })],
(req, res)=> {

  if(req.session.user && req.cookies.user_sid) {
    const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() },'password is less than 5 ');
  } else { User.query().findOne({ 
    email: req.body.email})
    .then (function(user) {
      if(user) {
        return res.status(406).json("the Email you entered is used. please choose another name ")
      } else {

    User.query().insert({
  name: req.body.name,
  email: req.body.email,
  password: req.body.password
  }).then( newuser => {
  res.status(200).json(newuser)
      })
    .catch( error => {
      res.status(406).json('cant add user try again')
        })
      }
    })
  }
} 
   else {
  res.status(403).json('cant add user to darabase must login first')
}
})

//adding user GET 
app.get('/adduser', (req, res) => {
  if(req.session.user && req.cookies.user_sid) {
    res.sendFile(path.join(__dirname + '/views/dashboard.html'));
  } else {
    res.status(403).json('cant get to adduser must login')
  }
});

//update user by name POST
app.post('/update',bodyParser.text({type: '*/*'}),(req, res) => {
  if(req.session.user && req.cookies.user_sid) { 
    const email = req.body.email
    const name = req.body.newName

  User.query()
    .patch({
      "name": name,
    })
    .where({email : email})
    .then(
      res.status(200).json('update successfuly')
    )
    .catch(error => {
      res.status(400).json(error)
    })  
  } else {
    res.status(403).json('cant add user to darabase must login first')
  }
})

//update user by name GET 
app.get('/update', (req, res) => {
  if(req.session.user && req.cookies.user_sid) {
    res.sendFile(path.join(__dirname + '/views/dashboard.html'));
  } else {
    res.status(403).json('cant get to update user must login')
  }
});


//delete User by ID POST
app.post('/delete',(req, res) => { if(req.session.user && req.cookies.user_sid)
  { const Userid = req.body.id
     User.query().findOne({ id: Userid})
      .then(function(user) {
        if(user) {
          User.query().deleteById(Userid)
          .then(
            res.status(200).json('delete successfuly')
            )
            .catch(error => {
              res.status(400).json(error)
            }) 
        } else { 
          res.status(400).json("no such user with this ID please enter a Valid ID ")
          }
        })
      } else { 
        res.status(403).json('cant delete, login first') 
  } 
})

//delete User by ID POST GET 
app.get('/delete', (req, res) => {
  if(req.session.user && req.cookies.user_sid) {
    res.sendFile(path.join(__dirname + '/views/dashboard.html'));
  } else {
    res.status(403).json('cant get to delete user must login')
  }
});

//logout GET
app.get('/logout', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
      res.clearCookie('user_sid');
      res.redirect('/');
  } else {
      res.redirect('/signin');
  }
});

//main route 
app.get("/",(req, res) => {
  res.sendFile(path.join(__dirname + '/views/login.html'));
});

//api listen
app.listen(port, function() {
    console.log("listening on port: ", port);
  })