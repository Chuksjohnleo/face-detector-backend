var express = require('express')
const bcrypt = require('bcrypt-nodejs');
var cors = require('cors');
var knex = require('knex');
var Register = require('./Controllers/register')
const Clarifai = require('clarifai');
const path = require('path');
const fs = require('fs');

// const db = knex({
//     client: 'pg',
//     connection: {
// connectionString: process.env.DATABASE_URL,
//         ssl: {
//           rejectUnauthorized: false
//         }
//     }
// });
const db = knex({
    client: 'pg',
    connection: {
        host: '',
        user: '',
        password: '',
        database: ''
    }
});

const app = express();

app.use(express.raw({limit:'5mb'}));
app.use(express.json({limit:'5mb'}));
app.use(express.urlencoded({
    limit: '5mb',
    extended: false
  }));
app.use(cors());

app.post('/signin', (req, res) => {
    const {email , password} = req.body;
    if(!email || !password){
        return  res.status(400).json('Oga enter something');
      }
 return   db.select('email','hash').from('login')
    .where('email','=',email)
    .then(data=>{
     const isValid = bcrypt.compareSync(password, data[0].hash);
     if(isValid){
      return db.select('*').from('users')
       .where('email','=',email)
       .then(user=>{ res.json(user[0])})
       .catch(err=>{res.status(400).json('err')})
      }
      res.status(400).json('wrong details')
    }).catch(err=>{res.json(err)});
})
app.post('/register',(req, res)=>{Register.handleRegister(req, res, db, bcrypt)})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
  return  db.select('*').from('users')
        .where({ id })
        .then(user => {
            if (user.length) { res.json(user) }
            res.status(404).json('no such user')
        }).catch(err => {
            console.log(err);
        });
});

app.post('/detect',(req, res)=>{ 
const imageApp = new Clarifai.App({
    apiKey: "apikey here"
  });
  imageApp.models.predict(Clarifai.FACE_DETECT_MODEL,req.body.input)
  .then(resp=>{
    res.json(resp);
  })
  .catch(err=>{res.json(err);
})
});

app.put('/image', (req, res) => {
    const { id } = req.body;
  db('users')
  .where('id', '=' , id)
  .increment('entries',1)
  .returning('entries')
  .then(entries=>{
    res.json(entries[0].entries);
  }).catch(err=>{
    res.status(400).json('oh no')
    console.log(err);
  })

});
app.listen(3004, () => {
    console.log('running on port 3004')
});

//pseudo code
/*
sigin --- POST = success/failed
register -- POST = user (store)
profile/userId -- GET = user
image --- PUT --- user
*/
