var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const jwt = require('jsonwebtoken');
var app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const uri = "mongodb+srv://bitklick:bitklick321@cluster0.wvq6r.mongodb.net/bitklicks?retryWrites=true&w=majority";
mongoose.connect(uri,{useNewUrlParser: true},()=>console.log("db connected"))

const Chat = require('./Models/Chat')
var tempuser = require('./Models/tempuser');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(session())
app.use(cors())
app.use(session({ resave: false ,secret: '123456' , saveUninitialized: true}));

app.use(function(err, req, res, next) {
  
  if(res.status(err.status || 500 )){
  res.render('error', {
      message: err.message,
      error: err
  });
}
else{
  next();
}
});


const http = app.listen(process.env.PORT || 3000)

const { 
  v1: uuidv1,
  v4: uuidv4,
} = require('uuid');






app.get('/sellermess',async(req,res)=>{
  Chat.find({},(err,data)=>{
    console.log(data+"sellermess")
    res.render('sellerchat',{data:data, sess: req.session.userData})
  })
})


app.get('/messopened',async(req,res)=>{
  Chat.find({to:req.session.userData.email},(err,data)=>{
    console.log(data+"sellermess")
    res.render('sellerchat',{data:data, sess: req.session.userData})
  })
})

app.get('/join/:roomId/:user',async(req,res)=>{
// http://localhost:3000/join/4b643696-554c-4133-88c9-2f3c40f12d7e/balramb957@gmail.com

  const {roomId,user} = req.params;

  const payload = {
    to:user,
    from:req.session.userData.email,
    type:"Seller",
    roomId:roomId
  };
console.log(payload + "fromsellerjoin")

  const options = { expiresIn: '2d' };
  const secret = 'aaaa';
  const token = await jwt.sign(payload, secret, options);
    Chat.findOne({roomId:roomId},(err,data)=>{
      console.log(data+"fromchats")
      console.log(data.Message+"fromchatsmessage")

      if(data){
    res.render(__dirname + '/routes/index.ejs',{message:data.Message,sess:req.session.userData,from:token.user,to:token.Seller,token:token})
      }
    })



  
})


app.get('/mess',(req,res)=>{
  res.render('./Auth/mess',{sess:req.session.userData})
})

app.post('/mess',async(req,res)=>{
const {from,to} = req.body;
const payload = {
  from:from,
  to:to,
  type:"user",
  roomId:uuidv4()
};
const options = { expiresIn: '2d' };
const secret = 'aaaa';
const token = await jwt.sign(payload, secret, options);
  tempuser.find({email:to},(err,data)=>{
    if(data){
      Chat.insertMany({user:req.session.userData.email,Seller:to,uuid:uuidv1(),roomId:payload.roomId},(err,done)=>{
        if(done){
          res.render(__dirname + '/routes/index.ejs',{message:done,sess:req.session.userData,from:from,to:to,token:token})
        }
      })
    }
  })

})



app.get('/slack', (req, res) => {
  res.sendFile(__dirname + '/routes/index.html')
})

// Socket fuser
const io = require('socket.io')(http,{
  cors: {
    origin: '*',
  }
})

io.on('connection', (socket) => {

  console.log('Connected...')
  socket.on('message', (msg) => {
    console.log(socket.uniqueUserId + "soccc")
      Chat.updateOne({roomId:socket.roomId},{$push:{Message:{from:socket.uniqueUserId,to:socket.to,Message:msg.message}}},(err,data)=>{
      err?console.log(err):console.log(data);
    })
    console.log(msg.user + "frommmessage")
    socket.broadcast.emit('message', msg)

    })
    socket.on('join',async (data)=>{
      console.log(data, + "dataaa")
      data = data.trim()
      console.log(data+"data")
      
      const decoded = await jwt.verify(data,'aaaa');
      
        console.log(decoded.from + decoded.to + "deco2");

      socket.uniqueId = decoded.from + decoded.to;
        const room = decoded.roomId;
        socket.join(room);
        socket.uniqueUserId = decoded.from;
        socket.type = decoded.type;
        socket.roomId = decoded.roomId;
        // const room = decoded.roomId;
        socket.to = decoded.to;
        console.log(socket.uniqueUserId,socket.to+"heree")
  console.log(data.token + "tokenaa");
        console.log(socket.uniqueUserId + "uniqueuserid");
     console.log(socket.to + "to")
     
      })
      
    
  socket.on('sendMessage',(msg)=>{
      console.log(msg)

    })   
})


// socket.io ended









app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
