
var tempuser = require('../Models/tempuser');
var Orders = require('../Models/orders');
var user = require('../Models/user');
const review = require('../Models/review')
var feedback = require('../Models/feedback')
const Chat = require('../Models/Chat')
var product = require('../Models/product');
const ratings = require('../Models/rating')
const { exists } = require('../Models/tempuser');

const mongoose = require('mongoose');
const uri = "mongodb+srv://bitklick:bitklick321@cluster0.wvq6r.mongodb.net/bitklicks?retryWrites=true&w=majority";
mongoose.connect(uri,{useNewUrlParser: true},()=>console.log("db connected"))



var express = require('express');
var router = express.Router();

const { 
  v1: uuidv1,
  v4: uuidv4,
} = require('uuid');

const sendMail = require('../utils/mailer.js')
const bcrypt = require('bcrypt');
var mongoXlsx = require('mongo-xlsx');
const { ImATeapot } = require('http-errors');
const axios = require('axios');

const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser')
const fs = require('fs');
const { ceil } = require('lodash');
router.use(express.static('public'));
router.use(bodyParser({uploadDir:'../public'}));
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname.split('.')[0] + '-' + Date.now() + '.' +file.originalname.split('.')[1])
  }
})
 
var upload = multer({ storage: storage })

// var LoginRedirect = function (req, res, next) {
//   try{
   
// if(req.session.userData.userType == 'admin'  || req.session.userData.userType == 'Admin'){
//   res.redirect('/admin/dashboard')
// }
// else if(req.session.userData.userType == 'agent' || req.session.userData.userType == 'Agent'){
//   res.redirect('/Agent/Home');
// }
// else if(req.session.userData.userType == 'Seller' || req.session.userData.userType == 'seller'){
//   res.redirect('/Seller/EditItems')
// }
//     else{
//       next();
//       // res.redirect('/')
//       }
//     }
//     catch(e){
//       res.redirect('/')
//     }
//   }
var LoginCheck = function (req, res, next) {
try{
  if(req.session.userData){
    next();
  
  }
  else{
    res.redirect('/')
    }
  }
  catch(e){
    res.redirect('/')
  }
}
var AgentAdminCheck = function (req, res, next) {
  try{
    if(req.session.userData.userType == 'Agent' || req.session.userData.userType == 'agent' || req.session.userData.userType == 'Admin' || req.session.userData.userType == 'admin' ){
      next();
    
    }
    else{
      res.redirect('/')
      }
    }
    catch(e){
      res.redirect('/')
    }
  }
  var AgentCheck = function (req, res, next) {
    try{
    if(req.session.userData.userType == 'Agent' || req.session.userData.userType == 'agent' ){
      next();
    
    }
    else{
      res.redirect('/')
      }
    }
  
  catch(e){
    res.redirect('/')
    
  }
    }

  
  var SellerCheck = function (req, res, next) {
  try{
    if(req.session.userData.userType == 'Seller' || req.session.userData.userType == 'seller' ){
      next();
    
    }
    else{
      res.redirect('/')
      }
  }

  catch(e){
    res.redirect('/')
    
  }
  }


  var AdminCheck = function (req, res, next) {
    try{
    if(req.session.userData.userType == 'Admin' || req.session.userData.userType == 'admin' ){
      next();

    
    }
    else{
    res.redirect('/')
    }
    // console.log(req.statusCode + "req" + res.statusCode + "res" +next.statusCode + "nexxt")
  
  }
  
  catch(e){
    res.redirect('/')
    
  }
}




// AGENT ROUTES FROM HERE
router.post('/addproduct' ,AgentAdminCheck ,(req,res,) =>{
  product.findOne({pname:req.body.pname})
  .then(proname =>{
    if(proname){
      res.render("alertsTemplate",{alertclass:'alert-warning',alertMessage:'Product Already Exist'});
    
      res.render("alertsTemplate",{alertclass:'alert-warning',alertMessage:'product already exist'});
 
    }
    else{
      const{pname,cname,asin,promotion,aval,brand,store} = req.body;
      product.create({pname:pname,cname:cname,asin:asin,promotion:promotion,aval:aval,brand:brand,store:store},(err,result)=>{
        if (err) throw err
        console.log(result);
       res.render('./Admin/addproduct',{sess:req.session.userData});
        
      })
    }
  })  
});
router.get('/addproduct',AgentAdminCheck, (req , res) =>{
    res.render('./Admin/addProduct',{sess:req.session.userData});
});
router.get('/Agent/ReviewItems',SellerCheck,(req,res)=>{
  res.render('./Auth/agentItemsReviewItems',{sess:req.session.userData});
})
router.get('/Agent/RankingItems',SellerCheck,(req,res)=>{
  res.render('./Auth/agentItemsRankingItems.ejs',{sess:req.session.userData})
})
router.get('/Agent/FeedbackItems',SellerCheck,(req,res)=>{
  res.render('./Auth/agentItemsFeedbackItems',{sess:req.session.userData})
})
router.get('/Agent/FreeShippingItems',SellerCheck,(req,res)=>{
  res.render('./Auth/agentItemsFreeShippingItems',{sess:req.session.userData})
})

router.get('/Agent/Home',AgentCheck,(req,res)=>{
  res.render('./Auth/agent' , {title : 'Register',sess:req.session.userData});
})
router.get('/Agent/Items',AgentCheck,(req,res)=>{
  res.render('./Auth/agentItems',{sess:req.session.userData})
})
router.post('/Agent/Items/Items',AgentCheck,(req,res)=>{
  const {ItemName,ASIN,STORE,Country,Promotion,BRAND,pagename} = req.body;
  res.render('./Auth/agentItemsCommon',{title:pagename,sess:req.session.userData})
})
router.get('/Agent/Edit/Orders',SellerCheck,(req,res)=>{
  res.render('./Auth/agentEditOrders',{sess:req.session.userData})
})
router.get('/Agent/Static',AgentAdminCheck,(req,res)=>{
 
  async function collectioncount(){
    var productCount = 0;
    var feedbackCount = 0;
    var ratingCount = 0;
    var reviewCount = 0; 
    await product.count({},(err,prodata)=>{
      productCount = prodata;
    })
  await feedback.count({},(err,feeddata)=>{
    feedbackCount = feeddata;
  })
  await ratings.count({},(err,ratingdata)=>{
    ratingCount = ratingdata;
  })
  await review.count({},(err,reviewdata)=>{
    reviewCount = reviewdata;
  })
  await console.log(productCount,feedbackCount,ratingCount,reviewCount);
  let data = {
    productCount:productCount,
    feedbackCount:feedbackCount,
    ratingCount:ratingCount,
    reviewCount:reviewCount
  }
  console.log(data);
  res.render('./Auth/agentStatic',{data:data,sess:req.session.userData});
}
collectioncount();
  
})
router.get('/Agent/Add/Orders',(req,res)=>{
  product.find({},(err,data)=>{
    console.log(data);
  res.render('./Auth/agentaddorders',{sess:sess,data:data})
})
})
// router.get('/Agent/Add/Order',(req,res)=>{
//   const {ItemName,ASIN,STORE,LINK} = req.body;
//   console.log(ItemName,ASIN,STORE,LINK)
//   product.find({$or: [{ItemName:ItemName},{Asin:ASIN},{Store:STORE},{Link:LINK}]},(err,data)=>{
//     if(err) throw err
//     // res.send(data);
//     res.render('./Auth/order', {data:data,sess:sess}  )
//   })
//   })

router.post('/Agent/Add/Orders',(req,res)=>{
const {ItemName,ASIN,STORE,LINK} = req.body;
console.log(ItemName,ASIN,STORE,LINK)
product.find({$or: [{ItemName:ItemName},{Asin:ASIN},{Store:STORE},{Link:LINK}]},(err,data)=>{
  if(err) throw err
  // res.send(data);
  res.render('./Auth/order', {data:data,sess:req.session.userData}  )
})
})
router.get('/Agent/Messenger',AgentAdminCheck,(req,res)=>{
  // agetn and adin
  if(req.session.userData.userType == 'admin' || req.session.userData.userType == 'Admin' || req.session.userData.userType == 'agent' || req.session.userData.userType == 'Agent'){
  res.render('./Auth/agentmessenger',{sess:req.session.userData})
  }
  else{
    res.redirect('/')
  }
})
router.get('/Agent/Messenger/wp',AgentAdminCheck,(req,res)=>{
  if(req.session.userData.userType == 'Agent' || req.session.userData.userType == 'agent' || req.session.userData.userType == 'admin' || req.session.userData.userType == 'Admin'){
  res.render('./Auth/AgentMessengerwp',{sess:req.session.userData});
  }else{
    res.redirect('/')
  }
})
router.post('/Agent/Messenger/wp',AgentAdminCheck,(req,res)=>{
  const {ItemName,LINK,STORE,sells,Options,ItemPrice,SellerOwnPart,excincfees,Conditions,Owntext} = req.body;
  res.redirect(`https://api.whatsapp.com/send?phone=+919511585441&text=*${ItemName} ${LINK} ${STORE} ${sells}*`);
})
router.get('/Agent/Messenger/tg',AgentAdminCheck,(req,res)=>{
  if(req.session.userData.userType == 'Agent' || req.session.userData.userType == 'agent' || req.session.userData.userType == 'admin' || req.session.userData.userType == 'Admin'){
  
  res.render('./Auth/AgentMessengertg',{sess:req.session.userData});
  }else{
    res.redirect('/')
  }
})
 
router.post('/Agent/Messenger/tg',AgentAdminCheck,(req,res)=>{
  const {ItemName,LINK,STORE,sells,Options,ItemPrice,SellerOwnPart,excincfees,Conditions,Owntext} = req.body;
  axios.get(`https://api.telegram.org/bot1605210753:AAELmZEpXSjw71ePQ0MUZz18dNgNcoXDL1g/sendMessage?chat_id=-534772533&text=${ItemName} ${LINK} ${STORE}`)
  .then((data)=>res.redirect('/Agent/Messenger'))
})
router.get('/Agent/Profile',LoginCheck,(req,res)=>{
  res.render('./Auth/agentprofile',{sess:req.session.userData})
})


//  seller routes
router.get('/Seller/Orders/Agent',AgentAdminCheck,(req,res)=>{
  if(req.session.userData.userType == 'admin' || req.session.userData.userType == 'Admin'){
    Orders.find({},(err,data,)=>{
      if(data){
      res.render('./Auth/SellerOrders',{Orders:data,sess:req.session.userData})
              }
          else{
      console.log(err);
            }
          })
  }
  else if(req.session.userData.userType == 'Agent' || req.session.userData.userType == 'agent')
  {
      Orders.find({productPostedby:req.session.userData.Username},(err,data,)=>{
      if(data){
      res.render('./Auth/SellerOrders',{Orders:data,sess:req.session.userData})
              }
          else{
      console.log(err);
            }
 
  })
}
else{
  res.redirect('/')
}
})
router.post('/Seller/Orders/Agent/:id', AgentAdminCheck,(req,res)=>{
Orders.findOneAndUpdate({_id:req.params.id},{$set:{productDelivered:true}},(err,data)=>{
err?console.log(err):res.redirect('/Seller/Orders/Agent')
})
res.render("alertsTemplate",{alertclass:'alert-success',alertMessage:'Order is Updated'});

})
router.post('/Seller/Orders/Agent/:id/cancel',AgentAdminCheck,(req,res)=>{
Orders.findOneAndUpdate({_id:req.params.id},{$set:{productCancelled:true}},(err,data)=>{
  err?console.log(err):res.redirect('/Seller/Orders/Agent')
})
})
var ProductCount;
router.get('/testroute',(req,res)=>{

const tablelimit = req.query.tablelimit || 5;
const tablepage = req.query.tablepage || 1;
console.log(req);
product.count({},(err,data)=>{
if(data){
    ProductCount = data;
}}
)
product.find({})
.sort({ update_at: -1 })
.skip(Number(tablepage)===1?'':Number(tablelimit)* Number(tablepage))
.limit(Number(tablelimit))
.exec((err, data)=>{
  let pagesNum = ceil(ProductCount / tablelimit);
  
res.render('./Auth/sellerEditItemsold',{data:data,sess:"none",pagesNum:pagesNum,tablelimit:tablelimit})
})
})

router.get('/seller/dashboard',SellerCheck,(req,res)=>{
  res.render('./Auth/sellerdashboard',{sess:req.session.userData})
})
router.get('/Seller/EditItems',LoginCheck,(req,res)=>{
  product.find({},(err,data)=>{
      res.render('./Auth/sellerEditItems',{data:data,sess:req.session.userData})  
    })
  //   if(req.session.userData.userType == 'admin' || req.session.userData.userType == 'Admin' ){
//   product.find({},(err,data)=>{
//   res.render('./Auth/sellerEditItems',{data:data,sess:req.session.userData})  
// })
// }
// else{
//   product.find({PostedByemail:req.session.userData.email},(err,data)=>{
//     res.render('./Auth/sellerEditItems',{data:data,sess:req.session.userData})  
//   })
//   }

})
router.get('/seller/delete/product/:id',AgentAdminCheck,(req,res)=>{
  
  product.findByIdAndDelete(req.params.id,(err,data)=>{
    res.redirect('/Seller/EditItems')
  })
})
router.get('/seller/edit/product/:id',AgentAdminCheck,(req,res)=>{
  product.findById({_id:req.params.id},(err,data)=>{
    res.render('./Auth/sellerproductedit',{data:data,sess:req.session.userData});
  })
})
router.post('/seller/edit/product/:id',AgentAdminCheck,(req,res)=>{
  const {keywords,Asin,Link,Store,option,Country,Amount,Amountperday,Price,OwnPart,Condition,RefundWithFeedback,allowedagenttakeselfpart,Refundinclfee,ReviewwithPic,Reviewwithvideo} = req.body;
  
  product.findByIdAndUpdate(req.params.id, { $set: {
    PostedBy:req.session.userData.Username,PostedByemail:req.session.userData.email,keywords:keywords,Asin:Asin,Link:Link,Store:Store,option:option,Country:Country,Amount:Amount,Amountperday:Amountperday,Price:Price,OwnPart:OwnPart,Condition:Condition,RefundWithFeedback:RefundWithFeedback,allowedagenttakeselfpart:allowedagenttakeselfpart,Refundinclfee:Refundinclfee,ReviewwithPic:ReviewwithPic,Reviewwithvideo:Reviewwithvideo
    
    }},(err,data)=>{
      err?console.log(err):res.redirect('/Seller/EditItems')
    })
})
router.post('/seller/add/product',AgentAdminCheck,(req,res)=>{
  const {keywords,Asin,Link,Store,option,Country,Amount,Amountperday,Price,OwnPart,Condition,RefundWithFeedback,allowedagenttakeselfpart,Refundinclfee,ReviewwithPic,Reviewwithvideo} = req.body;
 
 for(let i = 0;i <= Asin.length;i++){
   console.log(i)
 }
  product.insertMany({PostedBy:req.session.userData.Username,PostedByemail:req.session.userData.email,keywords:keywords,Asin:Asin,Link:Link,Store:Store,option:option,Country:Country,Amount:Amount,Amountperday:Amountperday,Price:Price,OwnPart:OwnPart,Condition:Condition,RefundWithFeedback:RefundWithFeedback,allowedagenttakeselfpart:allowedagenttakeselfpart,Refundinclfee:Refundinclfee,ReviewwithPic:ReviewwithPic,Reviewwithvideo:Reviewwithvideo},(err,data)=>{
    if (err) throw err
    res.redirect('/Seller/EditItems')
  })
})
router.get('/updateprofile',LoginCheck,(req,res)=>{
  res.render('./Auth/profileupdate',{sess:req.session.userData})
})

router.post('/updateprofile' ,upload.single('profileimage'), (req , res) =>{
  console.log(req.body)
  const handleError = (err, res) => {
  };
console.log(req.file)
const tempPath = req.file.path;
const targetPath = path.join(__dirname, "./uploads/image.png");
console.log(tempPath,targetPath);
if (path.extname(req.file.originalname).toLowerCase() === '.jpg' || '.png') {
  fs.rename(tempPath, targetPath, err => {
    res
      .render("alertsTemplate",{alertclass:'alert-success',alertMessage:'File Uploaded <br/> Login Again to view Changes'});

  });
} else {
  fs.unlink(tempPath, err => {
    res
    .render("alertsTemplate",{alertclass:'alert-warning',alertMessage:'Only .png / .jpg files are allowed'});

  });
}
  tempuser.updateOne({email:req.session.userData.email,Username:req.session.userData.Username,userType:req.session.userData.userType} , {
    Username : req.body.Username,
    First_name : req.body.First_name,
    Last_name : req.body.Last_name,
    email : req.body.email,
    userType:req.body.Role,
    we_chat : req.body.we_chat,
    wassup : req.body.wassup,
    facebook : req.body.facebook,
    ProfilePic:req.file.filename,
   },(err,done)=>{
     if(err) throw err;
     console.log(done);
   })
})




// ADMIN ROUTES

router.get('/admin' , AdminCheck,(req,res) =>{
  res.render('./Admin/admin' , {title: 'admin panel',sess:req.session.userData});
});
router.get('/admin/feedback',AdminCheck,(req,res)=>{
  feedback.find({}, (err, data)=>{
    console.log(data);
    res.render('./Admin/feedback' , {title: 'review', data:data});
  })
  
});
router.get('/admin/reviews',AdminCheck,(req,res)=>{
review.find({}, (err, data)=>{
  console.log(data);
  res.render('./Admin/reviews' , {title: 'review', data:data});
})

});

router.get('/admin/dashboard',AdminCheck,(req,res)=>{
  if(req.session.userData.userType == 'admin' || req.session.userData.userType == 'Admin' ){
    tempuser.find({},(err,data)=>{
      res.render('./Admin/userlist',{data:data,sess:req.session.userData})
    })
  }
  else{
    res.redirect('/')
  
}
console.log(res)

})


router.get('/download' , LoginCheck,(req , res) =>{
  var mongoXlsx = require('mongo-xlsx');
  product.find(function(err,data){
console.log(data);
 
/* Generate automatic model for processing (A static model should be used) */
var model = mongoXlsx.buildDynamicModel(data);
 
/* Generate Excel */
mongoXlsx.mongoData2Xlsx(data, model, function(err, data) {
  console.log('File saved at:', data.fullPath); 
res.download(`./${data.fullPath}`);
setTimeout(()=>{
  var filePath = `./${data.fullPath}`; 
  fs.unlinkSync(filePath);
},6000)
});
})
})
var productbackup,feedbackBackup,userbackup,reviewbackup,ordersbackup
router.get('/backup',AdminCheck,(req,res)=>{
  if(req.session.userData.userType =='admin' || req.session.userData.userType == 'Admin'){
  var mongoXlsx = require('mongo-xlsx');
  product.find(function(err,data){
 
/* Generate automatic model for processing (A static model should be used) */
var model = mongoXlsx.buildDynamicModel(data);
 
/* Generate Excel */
mongoXlsx.mongoData2Xlsx(data, model, function(err, data) {
  console.log('File saved at:', data.fullPath); 
   productbackup = data.fullPath;
});
})
feedback.find(function(err,data){
  var model = mongoXlsx.buildDynamicModel(data);
  console.log(data);
  mongoXlsx.mongoData2Xlsx(data , model, function(err, data){
    console.log('File saved at:', data.fullPath)
   feedbackBackup = data.fullPath;
  });
})
review.find(function(err,data){
  var model = mongoXlsx.buildDynamicModel(data);
  console.log(data);
  mongoXlsx.mongoData2Xlsx(data , model, function(err, data){
    console.log('File saved at:', data.fullPath)
   reviewbackup = data.fullPath;
  });
})
Orders.find(function(err,data){
  var model = mongoXlsx.buildDynamicModel(data);
  console.log(data);
  mongoXlsx.mongoData2Xlsx(data , model, function(err, data){
    console.log('File saved at:', data.fullPath)
   ordersbackup = data.fullPath;
    
  });
}) 
tempuser.find(function(err,data){
  var model = mongoXlsx.buildDynamicModel(data);
  console.log(data);
  mongoXlsx.mongoData2Xlsx(data , model, function(err, data){
    console.log('File saved at:', data.fullPath)
   userbackup = data.fullPath;
    
  });
})
async function createZip(){
var output = fs.createWriteStream('./backup.zip');
var archive = archiver('zip', {
    gzip: true,
});
archive.on('error', function(err) {
  throw err;
});
archive.pipe(output);
console.log(productbackup+"fromarchie");
await archive.file(`./${productbackup}`, {name: 'product.xlsx'},err=>console.log(err));
await archive.file(`./${ordersbackup}`, {name: 'orders.xlsx'},err=>console.log(err));
await archive.file(`./${feedbackBackup}`, {name: 'feedback.xlsx'},err=>console.log(err));
await archive.file(`./${userbackup}`, {name: 'user.xlsx'});
await archive.file(`./${reviewbackup}`, {name: 'review.xlsx'});
await archive.finalize(`./backup.zip`)
await setTimeout(()=>{
res.download(`./backup.zip`);
},3000)
await setTimeout(()=>{
  fs.unlinkSync(`./${productbackup}`);
  fs.unlinkSync(`./${ordersbackup}`);
  fs.unlinkSync(`./${feedbackBackup}`);
  fs.unlinkSync(`./${userbackup}`);
  fs.unlinkSync(`./${reviewbackup}`);
  fs.unlinkSync(`./backup.zip`);
},10000)
}
setTimeout(()=>{
createZip()
},4000)
}
else{
  res.redirect('/');
}
})







// COMMON OR UNKNOWN TO ME DONT KNOW ITS FOR SELLER OR AGENT OR ADMIN


router.get('/',function(req, res) {
  
  res.render('index', { title: 'Express' ,sess:"none"});
    
});
router.get('/register' ,(req,res) =>{
  console.log('regcalled')
   res.render('./Auth/register' , {title : 'Register',sess:req.session.userData});
 });
//  review kon krega
router.get('/review',(req,res)=>{
    res.render('./Admin/review' , {title: 'review',sess:req.session.userData});
 });
 router.get('/forgetpassword' ,(req,res) =>{
     res.render('./Auth/forgetpassword' , {title: 'Forgetpassword',sess:req.session.userData});
 });
 router.post('/forgetpassword',(req,res)=>{
    const {email} = req.body;
    sendMail.sendMail(email)
     setTimeout(()=>res.redirect('/'),4000)
 })
 
router.get('/register' ,(req,res) =>{
  res.render('./Auth/register' , {title: 'Register',sess:"none"});
});

 router.post('/register' , (req,res) =>{
  tempuser.findOne({email: req.body.email, Username: req.body.Username})
  .then(tuser =>{
    if(tuser){
      res.render("alertsTemplate",{alertclass:'alert-warning',alertMessage:'Email/Username aready exists'});
  
    } else {
      const newtempuser = new tempuser({
           Username : req.body.Username,
           First_name : req.body.First_name,
           Last_name : req.body.Last_name,
           email : req.body.email,
           userType:req.body.Role,
           we_chat : req.body.we_chat,
           wassup : req.body.wassup,
           facebook : req.body.facebook,
           password : req.body.password
           
           
      });
      newtempuser.save()
      .then(tuser => {tempuser.create(tuser) 
      
        sendMail.sendMail(newtempuser.email,"Confirm Your Account",`Click below url to verify your account <a href = "http://localhost:3030/verify/email/${newtempuser.email}" >Click here to verify </a>`)      
      })
      
          .catch(err => console.log(err));
    }
    res.render('./Admin/review',{sess:req.session.userData});
  })
})

router.post('/login', function (req, res) {
	tempuser.findOne({email:req.body.email},function(err,data){
		if(data){
			
			if(data.password==req.body.password && data.isverified && data.isverifiedbyadmin){			
        // req.session.userData=data;
        console.log(req.session)
        req.session.userData = data;
        // localStorage.setItem('req.session.userData',JSON.stringify(req.session.userData));
        // localStorage = new LocalStorage();
        // localStorage.setItem('req.session.userData',JSON.stringify(req.session.userData) );
        console.log(data.userType)
        if(req.session.userData.userType == 'admin'  || req.session.userData.userType == 'Admin'){
          res.redirect('/admin/dashboard')
        }
        else if(req.session.userData.userType == 'agent' || req.session.userData.userType == 'Agent'){
          res.redirect('/Agent/Home');
        }
        else if(req.session.userData.userType == 'Seller' || req.session.userData.userType == 'seller'){
          res.redirect('/Seller/EditItems')
        }
        else{
          res.redirect('/something');
        }
				
			}else{
        res.render("alertsTemplate",{alertclass:'alert-success',alertMessage:'Wrong password! or Not approved By admin'});
      }
		}else{
      console.log(err);
      res.render("alertsTemplate",{alertclass:'alert-warning',alertMessage:'This Email Is not regestered!'});
		}
	});
});
router.get('/logout',(req,res)=>{
  // localStorage.clear();
  delete req.session;
  // res.clearCookie('connect.sid', { path: '/' });
  res.clearCookie();
  res.redirect('/');
  // req.session.userData.end
})

//something new 


router.get('/buy/Order/:id',SellerCheck ,(req,res)=>{

  const {id} = req.params;
  product.find({_id:id},(err,data)=>{
// console.log(req.session.userData)
// console.log(data);
    res.render('./Auth/buyproductform',{sess:req.session.userData,product:data})
  })
})
router.post('/buy/order/:id',SellerCheck ,(req,res)=>{
  const {id} = req.params;
  product.find({_id:id},(err,data)=>{
    console.log(data,req.session.userData);
  // Orders.insertMany({productPostedby:data.PostedBy,productPostedbyemail:data.PostedByemail,userfirstname:req.session.userData.Username,userlastname:req.session.userData.Last_Name,useremail:req.session.userData.email,userAsin:data.asin,userPrice:data.price,userQuantity:req.body.quantity,userAddress:req.body.address,userZip:req.body.zip},(err,data)=>{
  //   err?console.log(err):console.log(data)
  // })
})
  
})

var dataCheckbox = []
router.put('/buy/Order/multiselected',(req,res)=>{
  console.log(req.body + "frommulti");
  dataCheckbox = req.body.dataCheckbox;
  // db.bios.find( { contribs: { $in: [ "ALGOL", "Lisp" ]} } )
  // product.find({_id: {$in:[req.body.finalvalue]}},(err,data)=>{
  //   if(err) throw err
  //   // console.log(data);
  //   res.render('buyproductformmulti',{sess:sess,data:data})

  // })
  res.send("done")
  // res.render('./Auth/buyproductformmulti')


  // const {id} = req.params;
  // product.find({_id:id},(err,data)=>{
  //   res.render('buyproductform',{sess:sess,data:data})
  // })
})

  
  router.get('/buy/order/multiselected/form',LoginCheck,(req,res)=>{
    // console.log(req.session.dataCheckbox)
    product.find({_id: {$in:dataCheckbox}},(err,data)=>{
      console.log(data,req.session.userData);

      if(err) throw err
  
    res.render('./Auth/buyproductformmulti',{sess:req.session.userData,data:data})
  })
  })

  router.post('/buy/product/form/multi',(req,res)=>{
    console.log(req.body);
    const {PostedBy,PostedByemail,userfirstname,userlastname,useremail,userAsin,userPrice,userQuantity,userAddress,userZip} = req.body;
    if(typeof PostedBy != 'object' ){
      Orders.insertMany({productPostedby:PostedBy,productPostedbyemail:PostedByemail,userfirstname:userfirstname,userlastname:userlastname,useremail:useremail,userAsin:userAsin,userPrice:userPrice,userQuantity:userQuantity,userAddress:userAddress,userZip:userZip},(err,data)=>{
        err?console.log(err):console.log(data)
  
        if(data){
        }
      })
    }
    else{
    for(let i =0;i<PostedBy.length;i++){
    Orders.insertMany({productPostedby:PostedBy[i],productPostedbyemail:PostedByemail[i],userfirstname:userfirstname,userlastname:userlastname,useremail:useremail,userAsin:userAsin[i],userPrice:userPrice[i],userQuantity:userQuantity[i],userAddress:userAddress[i],userZip:userZip[i]},(err,data)=>{
      if(data){
        console.log(data);
      }
    })
    
  }
}
  res.render("alertsTemplate",{alertclass:'alert-success',alertMessage:'Seller Will Soon Contact You'});

  });
    
  
 
router.get('/rating' , LoginCheck ,(req, res) =>{
  res.render('./Auth/rating',{sess:req.session.userData})
})
router.post('/rating',(req,res)=>{
  const {email,ProductAsin,rating} = req.body;
  console.log(req.body)
  
  ratings.findOne({$and:[{email:email},{ProductAsin:ProductAsin}]})
  .then(preview =>{
    if(preview){
      res.render("alertsTemplate",{alertclass:'alert-warning',alertMessage:'You have already rated Thanks and have nice day'});
        
    }
    else{
      var Ratingsum = 0;
      ratings.find({ProductAsin:ProductAsin},(err,data)=>{
        for(let i =0;i<data.length;i++){
            Ratingsum = Ratingsum+Number(data[i].rating);
          }
          var avgRating = Math.round(Ratingsum/data.length);
          console.log(avgRating)
          
        product.findOneAndUpdate({Asin:ProductAsin}, { $set: { AvgRating: avgRating } },(err,data)=>{
          if(data){
            console.log(data);
          }
        })
      ratings.create({email : req.session.userData.email , ProductAsin : ProductAsin , rating:rating},(err,result)=>{
        if (err) throw err
        console.log(result);
       res.render("alertsTemplate",{alertclass:'alert-success',alertMessage:'Thanks For Giving Review'});
        
      })
    })
    }
    
  })
  
})
router.get('/Uprofile' ,LoginCheck, (req , res) =>{
  res.render('./Auth/Uprofile',{sess:req.session.userData})
})
router.post('/Uprofile' , (req , res) =>{
  user.findOne({Username: req.body.Username})
  .then(data => {
    if(data){
      const query = { Username: req.body.Username };
      user.updateOne(query , {Mobile : req.body.Mobile});
      if(err) throw err;
    }
    console.log("updated");
  })
  
})
router.get('/product_Review' , LoginCheck,(req, res) =>{
  res.render('./Auth/review',{sess:req.session.userData})
})
	
router.post('/review' , LoginCheck,(req,res,) =>{
  var temail = req.session.userData.email ;
  var titemid = req.body.item_id;
 review.findOne({$and:[{email:temail},{item_id:titemid}]})
  .then(preview =>{
    if(preview){
      res.render("alertsTemplate",{alertclass:'alert-warning',alertMessage:'You have already reviewd Thanks and have nice day'});
    
    }
    else{
      const{email , item_id , description} = req.body;
      review.insertMany({email : email , item_id : item_id , description : description},(err,result)=>{
        if (err) throw err
        console.log(result);
      res.render("alertsTemplate",{alertclass:'alert-success',alertMessage:'Thanks for your review'});
        
      })
    }
  })  
});
router.get('/product_feedback',LoginCheck , (req , res) =>{
  res.render('./Auth/feedback',{sess:req.session.userData})
})
router.post('/feedback' ,LoginCheck,(req,res,) =>{
  var temail = req.session.userData.email ;
  var titemid = req.body.item_id;
 feedback.findOne({$and:[{email:temail},{item_id:titemid}]})
  .then(preview =>{
    if(preview){
      res.render("alertsTemplate",{alertclass:'alert-success',alertMessage:'Thanks for your Feedback'});
    
    }
    else{
      const{email , item_id , description} = req.body;
      feedback.insertMany({email : email , item_id : item_id , description : description},(err,result)=>{
        if (err) throw err
        console.log(result);
      res.render("alertsTemplate",{alertclass:'alert-success',alertMessage:'Thanks for your Feedback'});
        
      })
    }
  })  
});
router.get('/verify/email/:email',(req,res)=>{
  const email = req.params.email;
  tempuser.findOne({email:email},(err,data)=>{
    console.log(data)
 
      tempuser.updateOne(
      {email:data.email },
      { $set: { isverified : true } },
      {upsert : true},(err,d)=>{
        if(err) throw err
        console.log(d)
      }
   );
  })
res.render("alertsTemplate",{alertclass:'alert-success',alertMessage:'Your Email is verified '});

})
router.get('/verify/email/admin/:email',(req,res)=>{
  const email = req.params.email;
  tempuser.findOne({email:email},(err,data)=>{
    console.log(data)
      tempuser.updateOne(
      {email:data.email },
      { $set: { isverifiedbyadmin : true } },
      {upsert : true},(err,d)=>{
        if(err) throw err
        console.log(d)
      }
   );
  })
  res.redirect('/admin/dashboard')
})

router.get('/new',(req,res)=>{
  res.render('./new',{sess:req.session.userData})
})
router.post('/updateproduct' , AgentAdminCheck,(req , res) =>{
  
 product.updateOne({pname:req.body.pname} , {
    keywords:req.body.keyword,
    Asin:req.body.Asin,
    Link:req.body.Link,
    Store:req.body.Store,
    Option:req.body.Option,
    Country:req.body.Country,
    Amount:req.body.Amount,
    Amountperday:req.body.Amountperday,
    Price:req.body.Price,
    OwnPart:req.body.OwnPart,
    Condition:req.body.Condition,
    RefundWithFeedback:req.body.RefundWithFeedback,
    allowedagenttakeselfpart:req.body.allowedagenttakeselfpart,
    Refundinclfee:req.body.RefundWithFeedback,
    ReviewwithPic:req.body.ReviewwithPic,
    Reviewwithvideo:req.body.Reviewwithvideo
   },(err,done)=>{
     if(err) throw err;
     console.log(done);
   })
})
router.get('*',(req,res)=>{
    res.render('404');
})
module.exports = router;

// exports.req.session.userData = req.session.userData;

// module.exports = router;
