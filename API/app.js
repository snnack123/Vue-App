const express = require('express');
var cors = require('cors')
var jwt = require('jsonwebtoken')
const app = express();
var morgan = require('morgan');
const { nextTick } = require('process');
var faker = require('faker');
const { v4: uuidv4 } = require('uuid');
const port = 3000;

var fromCustomModule = require('./customModules/message');
console.log(fromCustomModule.msg);

const bcrypt = require('bcrypt');
const { exists } = require('fs');
const saltRounds = 12;
const secret = 'portocala'

app.use(cors())
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

function beforeEnteringRoute(req, res, next) {
  console.log("I've been here first");
  next();
}

function firstCriteria(req, res, next) {
  if (req.params.variable < 5) {
    console.log('Too small');
    res.status(401).send('Too small');
  } else next();
}

function secondCriteria(req, res, next) {
  if (req.params.variable > 20) {
    console.log('Too large');
    res.status(401).send("Too large");
  } else next();
}

let middlewareArray = [firstCriteria, secondCriteria];

//let products = ['bread','milk','coffee'];
let products = [
  {
    name: 'bread',
    id: '432',
    status: 'false'
  },
  {
    name: 'milk',
    id: '433',
    status: 'false'
  },
  {
    name: 'coffee',
    id: '434',
    status: 'false'
  }
]
let users = [];

function checkAuthorization(req, res, next) {
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;

    jwt.verify(req.token, secret, (err, decoded) => {
      if (err) {
        if (err.expiredAt) {
          res.json({ "message": "Your token expired!" });
        } else {
          res.json({ "message": "Decoding error!" });
        }
      } else {
        console.log(decoded.email);
        next();
      }
    })
  } else {
    res.json({ "message": "Missing token!" })
  }
}
app.get('/', beforeEnteringRoute, (req, res) => {
  res.send('Hello World!')
});

app.get('/middleware/:variable', middlewareArray, (req, res) => {
  console.log(req.params.variable);
  res.send('Perfect value');
})

/* Products operations */

app.get('/products', (req, res) => {
  res.json(products);
})

/* Create */
app.post('/product', checkAuthorization, (req, res) => {
  console.log('Vrei sa adaugi un produs.');
  let product = req.body;
  product.id = uuidv4();
  products.push(product);
  res.json({ "id": product.id });
})
app.get('/product/:id', (req, res) => {
  console.log('Vrei sa primesti detelii despre produsul cu id-ul: ' + req.params.id);
})
app.put('/product/:id', checkAuthorization, (req, res) => {
  console.log('Vrei sa actualizezi produsul cu id-ul: ' + req.params.id);
})
app.delete('/product/:id', checkAuthorization, (req, res) => {
  console.log('Vrei sa stergi produsul cu id-ul: ' + req.params.id);
  products = products.filter(element => element.id !== req.params.id);
  res.json({ 'message': 'Am sters produsul cu id ul' + req.params.id + ' de pe server!' });
})
/* End - Products operations */

app.get('/users', (req, res) => {
  res.json(users);
})

app.post('/data', (req, res) => {
  let data = req.body
  console.log('trying to post the following data: ', data)
  res.send('Succes')
});

app.post('/user', (req, res) => {
  let data = req.body;
  let emailExist = false;
  users.forEach((element) => {
    if (element.email === data.email)
      emailExist = true;
    else
      emailExist = false;
  })
  if (emailExist) {
    res.send('User already registered.')
  }
  else {
    bcrypt.hash(data.password, saltRounds).then(function (hash) {
      data.password = hash;
      users.push(data);
      console.log('trying to post the following data: ', data);
      res.send('Succesfull registration');
    })
  }
})

app.post('/login', (req, res) => {
  let data = req.body;

  let emailFound = false;

  users.forEach((element, index, array) => {
    if (element.email === data.email) {
      emailFound = true;
      bcrypt.compare(data.password, element.password).then(function (result) {
        if (result) {
          let token = jwt.sign({
            email: element.email
          }, secret, { expiresIn: 60 * 60 });

          let response = {};
          response.token = token;
          response.message = 'You have the right to access private resources'

          res.json(response);
        }
        else {

          let response = {};
          response.message = "Password missmatch";
          res.json(response)
        }
      });
    }
  })

  if (!emailFound) {

    let response = {};
    response.message = "No such email address.";
    res.json(response)
    res.send("No such email address.");
  }

})

app.get('/private', checkAuthorization, (req, res) => {


  res.send("Big secret: Santa Klaus doesn't exist");

})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});