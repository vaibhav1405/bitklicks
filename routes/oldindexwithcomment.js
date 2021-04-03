var express = require('express');
var router = express.Router();
var tempuser = require('../Models/tempuser');
var Orders = require('../Models/orders');
// var fs = require('fs');
var archiver = require('archiver');

var user = require('../Models/user');
const review = require('../Models/review')
  var feedback = require('../Models/feedback')
var app = express();
const Chat = require('../Models/Chat')

const { 
  v1: uuidv1,
  v4: uuidv4,
} = require('uuid');

var product = require('../Models/product');
const ratings = require('../Models/rating')
const sendMail = require('../utils/mailer.js')
const { check } = require('express-validator');
const { Mongoose } = require('mongoose');
const { json } = require('express');
const { exists } = require('../Models/tempuser');
const bcrypt = require('bcrypt');

//const { hash } = require('bcrypt');
var mongoXlsx = require('mongo-xlsx');
const { ImATeapot } = require('http-errors');
/*const review = require('../Models/review');*/
const session = require('express-session');
app.use(session({secret: 'ssshhhhh'}));
const axios = require('axios');
var sess = {
  _id:'6040b250c34f7856f80bf129',
  isverified  :true,
  Username  :"vaibhavasd",
  First_name  :"vaibhav",
  userType  :"Agent",
  Last_name  :"dadhich" ,
   email:"sgnchvqs@maxresistance.com",
  we_chat  :"aksdf",
  wassup  :4564421651,
  facebook  :"https://fb.com/vaibhav",
  password  :"tdYj26WYQwuHNJT",
  __v  :0,
  isverifiedbyadmin  :true,
  ProfilePic  :"Mirror-1616415665179.png"
}
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser')
const fs = require('fs');
const { ceil } = require('lodash');
app.use(express.static('public'));




app.use(bodyParser({uploadDir:'../public'}));
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname.split('.')[0] + '-' + Date.now() + '.' +file.originalname.split('.')[1])
  }
})
 
var upload = multer({ storage: storage })

var LoginCheck = function (req, res, next) {
  console.log("iamcalled")
  if(sess){
    next();
// app.locals.sessobject21 = sess;
  
  }
  res.redirect('/')

}
  var AgentCheck = function (req, res, next) {
    console.log("iamcalled")
    if(sess.userType == 'Agent' || sess.userType == 'agent' ){
      next();
  // app.locals.sessobject21 = sess;
    
    }
    res.redirect('/')
  
  }
  
  var SellerCheck = function (req, res, next) {
    console.log("iamcalled")
    if(sess.userType == 'Seller' || sess.userType == 'seller' ){
      next();
  // app.locals.sessobject21 = sess;
    
    }
    res.redirect('/')
  
  }
  var AdminCheck = function (req, res, next) {
    console.log("iamcalled")
    console.log(req + "fromadmin")
    if(sess.userType == 'Admin' || sess.userType == 'admin' ){
      next();
  // app.locals.sessobject21 = sess;
    
    }
    res.redirect('/')
  
  }



/* GET home page. */
router.get('/', function(req, res) {
  // sendMail.sendMail;
  console.log(sess)
  
  res.render('index', { title: 'Express' ,sess:sess });
});
router.get('/register' , (req,res) =>{
  console.log('regcalled')
   res.render('./Auth/register' , {title : 'Register',sess:sess});
 });

router.get('/review',(req,res)=>{
    res.render('./Admin/review' , {title: 'review',sess:sess});
 });
 router.get('/forgetpassword' , (req,res) =>{
     res.render('./Auth/forgetpassword' , {title: 'Forgetpassword',sess:sess});
 });
 router.post('/forgetpassword',(req,res)=>{
    //  res.render('./Auth/forgetpassword' , {title: 'Forgetpassword'});
    const {email} = req.body;
    sendMail.sendMail(email)
     //  res.render()
     setTimeout(()=>res.redirect('/'),4000)
 })
 router.get('/admin' , AdminCheck,(req,res) =>{
  res.render('./Admin/admin' , {title: 'admin panel',sess:sess});
});

router.get('/register' , (req,res) =>{
  res.render('./Auth/register' , {title: 'Register',sess});
});


router.post('/addproduct' ,AgentCheck, (req,res,) =>{
  product.findOne({pname:req.body.pname})
  .then(proname =>{
    if(proname){
      res.render("alertsTemplate",{alertclass:'alert-warning',alertMessage:'Product Already Exist'});
    
      // res.status(400).json({Username : "product already exist's"});
      res.render("alertsTemplate",{alertclass:'alert-warning',alertMessage:'product already exist'});
 
    }
    else{
      const{pname,cname,asin,promotion,aval,brand,store} = req.body;
      product.create({pname:pname,cname:cname,asin:asin,promotion:promotion,aval:aval,brand:brand,store:store},(err,result)=>{
        if (err) throw err
        console.log(result);
       res.render('./Admin/addproduct',{sess:sess});
        
      })
    }
  })  
});

// router.get('/showdata' , LoginCheck,(req,res) =>{
//   tempuser.find(function(err,tempusers){
//     res.render('./Admin/showdata' , {tempusers:tempusers,sess:sess})
//   })
// });

router.get('/addproduct' , (req , res) =>{
    res.render('./Admin/addproduct',{sess:sess});
});

 router.post('/register' , (req,res) =>{
  tempuser.findOne({email: req.body.email, Username: req.body.Username})
  .then(tuser =>{
    if(tuser){
      // return res.status(400).json({email:"Email aready exists"});
      res.render("alertsTemplate",{alertclass:'alert-warning',alertMessage:'Email aready exists'});
  
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
      // bcrypt.genSalt(10, (err ,salt) =>{
      //   bcrypt.hash(newtempuser.password, salt,(err , hash) => {
      //     if(err) console.log(err);
      //     newtempuser.password = hash;
      //     newtempuser.save()
      //     .then(tuser => tempuser.create(tuser) )
      //     .catch(err => console.log(err));

      //   })
      // })
    }
    res.render('./Admin/review',{sess:sess});
  })
}); // not working code to

router.post('/login', function (req, res) {

	//console.log(req.body);
	tempuser.findOne({email:req.body.email},function(err,data){
		if(data){
			
			if(data.password==req.body.password && data.isverified && data.isverifiedbyadmin){
				//console.log("Done Login");
			
				//console.log(req.session.userId);
        // made route of below line
				// res.render('./Auth/agent' , {title : 'Register'});
        sess =data;
        console.log(data.userType)
        // console.log(sess);
        // console.log(data.userType)
        // console.log(data[0].userType)
        // const {userType} = sess;
        // console.log(userType)
        if(sess.userType == 'admin'  || sess.userType == 'Admin'){
          res.redirect('/admin/dashboard')
        }
        else if(sess.userType == 'agent' || sess.userType == 'Agent'){
          res.redirect('/Agent/Home');
        }
        else if(sess.userType == 'Seller' || sess.userType == 'seller'){
          res.redirect('/seller/dashboard')
        }
        else{
          res.redirect('/something');
        }
				
			}else{
				// res.send({"Success":"Wrong password! or Not approved By admin"});
        res.render("alertsTemplate",{alertclass:'alert-success',alertMessage:'Wrong password! or Not approved By admin'});

      }
		}else{
      console.log(err);
			// res.send({"Success":"This Email Is not regestered!"});
      res.render("alertsTemplate",{alertclass:'alert-warning',alertMessage:'This Email Is not regestered!'});

		}
	});
});
router.get('/logout',(req,res)=>{
  delete req.sess;
  // delete sess;
  // res.send("logout")
  res.redirect('/');
  sess.end
})
router.get('/contactus',LoginCheck,(req,res)=>{
  res.render('./Auth/contactus',{sess:sess});
})
router.get('/privacypolicy',(req,res)=>{
  res.render('./Auth/privacypolicy',{sess:sess})
})
router.get('/Agent/ReviewItems',(req,res)=>{
  res.render('./Auth/agentItemsReviewItems',{sess:sess});
})
router.get('/Agent/RankingItems',(req,res)=>{
  res.render('./Auth/agentItemsRankingItems.ejs',{sess:sess})
})
router.get('/Agent/FeedbackItems',(req,res)=>{
  res.render('./Auth/agentItemsFeedbackItems',{sess:sess})
})
router.get('/Agent/FreeShippingItems',(req,res)=>{
  res.render('./Auth/agentItemsFreeShippingItems',{sess:sess})
})
router.get('/aboutus',(req,res)=>{
  res.render('./Auth/aboutus',{sess:sess});
})
router.get('/Agent/Home',AgentCheck,(req,res)=>{
  res.render('./Auth/agent' , {title : 'Register',sess:sess});
})
router.get('/Agent/Items',(req,res)=>{
  // res.render('./Auth/Items' , {title : 'Register'});
  // res.send("Agent Item");
  res.render('./Auth/agentItems',{sess:sess})

})
router.post('/Agent/Items/Items',(req,res)=>{
  const {ItemName,ASIN,STORE,Country,Promotion,BRAND,pagename} = req.body;
  res.render('./Auth/agentItemsCommon',{title:pagename,sess:sess})
})
router.get('/Agent/Edit/Orders',(req,res)=>{
  // res.send("/Agent/Edit/Orders");
  res.render('./Auth/agentEditOrders',{sess:sess})
})
router.get('/Agent/Static',(req,res)=>{
  // review.find({})
 

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
  res.render('./Auth/agentStatic',{data:data,sess:sess});
}
collectioncount();
  
})
var RatingProduct;
router.get('/Agent/Add/Orders',(req,res)=>{
 ratings.find({},(err,data)=>{
    RatingProduct = data;
 })
  product.find({},(err,data)=>{
    console.log(data);
  res.render('./Auth/agentaddorders',{sess:sess,data:data,Rating:RatingProduct})
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
  res.render('./Auth/order', {data:data,sess:sess}  )
})
})
router.get('/buy/Order/:id',SellerCheck ,(req,res)=>{
  const {id} = req.params;
  product.find({_id:id},(err,data)=>{
    res.render('buyproductform',{sess:sess,data:data})
  })
})
var dataCheckbox = []
router.post('/buy/Order/multiselected',(req,res)=>{
  console.log(req.body);
  dataCheckbox = req.body.dataCheckbox;

  res.render("alertsTemplate",{alertclass:'alert-success',alertMessage:'Successful'});

})


  
  router.get('/buy/order/multiselected/form',(req,res)=>{
    product.find({_id: {$in:dataCheckbox}},(err,data)=>{
    if(err) throw err
    console.log(data,sess);

    res.render('./Auth/buyproductformmulti',{sess:sess,data:data})

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
  res.send("Seller Will Soon Contact you")

  });
    

  router.get('/Seller/Orders/Agent', (req,res)=>{
    Orders.find({productPostedby:"vaibhavasd"},(err,data,)=>{
if(data){
        res.render('./Auth/SellerOrders',{Orders:data,sess:sess})
}
else{
  console.log(err);
}
   

    })

  })
  // Seller/Orders/Agent/605b62136a22bc3616e1d18b
  // Seller/Orders/Agent/605b62136a22bc3616e1d18b
  router.post('/Seller/Orders/Agent/:id', (req,res)=>{
// console.log(req)
Orders.findOneAndUpdate({_id:req.params.id},{$set:{productDelivered:true}},(err,data)=>{
  err?console.log(err):console.log(data);
})
// tempuser.save;
res.send("done")
})

router.post('/Seller/Orders/Agent/:id/cancel',(req,res)=>{
  Orders.findOneAndUpdate({_id:req.params.id},{$set:{productCancelled:true}},(err,data)=>{
    err?console.log(err):console.log(data);
  })
})


var ProductCount;
router.get('/testroute',(req,res)=>{
  
// const {tablelimit,tablepage} = req.query;
const tablelimit = req.query.tablelimit || 5;
const tablepage = req.query.tablepage || 1;

// typeof(req.params.limit);
  console.log(req);
  // console.log(req.params);
  // product.count({},())
  product.count({},(err,data)=>{
  if(data){
      ProductCount = data;
  }}
  )
  product.find({})

  .sort({ update_at: -1 })
  // Number(req.params.limit)===1?'null':skip(Number(req.params.limit)* Number(req.params.page))
  // .skip(0) 
  // if(Number(req.params.limit)===1){
  //   .skip
  // }
  .skip(Number(tablepage)===1?'':Number(tablelimit)* Number(tablepage))
  .limit(Number(tablelimit))
  .exec((err, data)=>{
    // console.log(data)
    // res.send(data)
    let pagesNum = ceil(ProductCount / tablelimit);
    
  res.render('./Auth/sellerEditItemsold',{data:data,sess:"none",pagesNum:pagesNum,tablelimit:tablelimit})
})
})
router.get('/Agent/Messenger',(req,res)=>{
  res.render('./Auth/agentmessenger',{sess:sess})
})
router.get('/Agent/Messenger/wp',(req,res)=>{
  res.render('./Auth/AgentMessengerwp',{sess:sess});
})
router.post('/Agent/Messenger/wp',(req,res)=>{
  const {ItemName,LINK,STORE,sells,Options,ItemPrice,SellerOwnPart,excincfees,Conditions,Owntext} = req.body;
  res.redirect(`https://api.whatsapp.com/send?phone=+919511585441&text=*${ItemName} ${LINK} ${STORE} ${sells}*`);
})

router.get('/Agent/Messenger/tg',(req,res)=>{
  res.render('./Auth/AgentMessengertg',{sess:sess});
})
 
router.post('/Agent/Messenger/tg',(req,res)=>{
  const {ItemName,LINK,STORE,sells,Options,ItemPrice,SellerOwnPart,excincfees,Conditions,Owntext} = req.body;
  axios.get(`https://api.telegram.org/bot1605210753:AAELmZEpXSjw71ePQ0MUZz18dNgNcoXDL1g/sendMessage?chat_id=-534772533&text=${ItemName} ${LINK} ${STORE}`)
  .then((data)=>res.redirect('/Agent/Messenger'))
})
router.get('/Agent/Profile',(req,res)=>{
  res.render('./Auth/agentprofile',{sess:sess})
})

// router.post


 


router.post('/download' , (req , res) =>{
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
// after 6 sec delete
});
})
})
var productbackup,feedbackBackup,userbackup,reviewbackup,ordersbackup
router.get('/backup',(req,res)=>{
  if(sess.userType =='admin' || sess.userType == 'Admin'){
  var mongoXlsx = require('mongo-xlsx');
  product.find(function(err,data){
// console.log(data);
 
/* Generate automatic model for processing (A static model should be used) */
var model = mongoXlsx.buildDynamicModel(data);
 
/* Generate Excel */
mongoXlsx.mongoData2Xlsx(data, model, function(err, data) {
  console.log('File saved at:', data.fullPath); 
   productbackup = data.fullPath;
// res.download(`./${data.fullPath}`);
});
})
feedback.find(function(err,data){
  var model = mongoXlsx.buildDynamicModel(data);
  console.log(data);
  mongoXlsx.mongoData2Xlsx(data , model, function(err, data){
    console.log('File saved at:', data.fullPath)
    // res.download(`./${data.fullPath}`);
   feedbackBackup = data.fullPath;

  });
})
review.find(function(err,data){
  var model = mongoXlsx.buildDynamicModel(data);
  console.log(data);
  mongoXlsx.mongoData2Xlsx(data , model, function(err, data){
    console.log('File saved at:', data.fullPath)
   reviewbackup = data.fullPath;

    // res.download(`./${data.fullPath}`);
  });
})
Orders.find(function(err,data){
  var model = mongoXlsx.buildDynamicModel(data);
  console.log(data);
  mongoXlsx.mongoData2Xlsx(data , model, function(err, data){
    console.log('File saved at:', data.fullPath)
   ordersbackup = data.fullPath;
    
    // res.download(`./${data.fullPath}`);
  });
}) 
tempuser.find(function(err,data){
  var model = mongoXlsx.buildDynamicModel(data);
  console.log(data);
  mongoXlsx.mongoData2Xlsx(data , model, function(err, data){
    console.log('File saved at:', data.fullPath)
   userbackup = data.fullPath;
    
    // res.download(`./${data.fullPath}`);
  });
})

async function createZip(){
var output = fs.createWriteStream('./backup.zip');
var archive = archiver('zip', {
    gzip: true,
    zlib: { level: 9 } // Sets the compression level.
});

archive.on('error', function(err) {
  throw err;
});

// pipe archive data to the output file
archive.pipe(output);

// append files
// name mia kya aayenga bhai?
console.log(productbackup+"fromarchie");
await archive.file(`./${productbackup}`, {name: 'product.xlsx'},err=>console.log(err));
// archive.file('/path/to/README.md', {name: 'foobar.md'});
await archive.file(`./${ordersbackup}`, {name: 'orders.xlsx'},err=>console.log(err));
await archive.file(`./${feedbackBackup}`, {name: 'feedback.xlsx'},err=>console.log(err));
await archive.file(`./${userbackup}`, {name: 'user.xlsx'});
await archive.file(`./${reviewbackup}`, {name: 'review.xlsx'});
await archive.finalize(`./backup.zip`)

// after 40 sec delted from server
// setTimeout(()=>{
//   // var filePath = `./${data.fullPath}`; 
//   fs.unlinkSync(`./${productbackup}`);
//   fs.unlinkSync(`./${ordersbackup}`);
//   fs.unlinkSync(`./${feedbackBackup}`);
//   fs.unlinkSync(`./${userbackup}`);
//   fs.unlinkSync(`./${reviewbackup}`);
//   fs.unlinkSync(`./backup.zip`);
// },40000)
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


router.get('/rating' , LoginCheck ,(req, res) =>{
  res.render('./Auth/rating',{sess:sess})
})
router.post('/rating',(req,res)=>{
  const {email,ProductAsin,rating} = req.body;
  console.log(req.body)
  
  ratings.findOne({$and:[{email:email},{ProductAsin:ProductAsin}]})
  .then(preview =>{
    if(preview){
      // res.status(400).json('You have already rated Thanks and have nice day');
      res.render("alertsTemplate",{alertclass:'alert-warning',alertMessage:'You have already rated Thanks and have nice day'});
        
    }
    else{
      // RatingArray = [];
      var Ratingsum = 0;
      ratings.find({ProductAsin:ProductAsin},(err,data)=>{
        for(let i =0;i<data.length;i++){
            // RatingArray.push(data[i].rating);
            Ratingsum = Ratingsum+Number(data[i].rating);
          }
          var avgRating = Math.round(Ratingsum/data.length);
          // average above
          console.log(avgRating)
          
        product.findOneAndUpdate({Asin:ProductAsin}, { $set: { AvgRating: avgRating } },(err,data)=>{
          if(data){
            console.log(data);
          }
        })
        //  ({Asin:ProductAsin})

      // const{email , item_id , description} = req.body;
      ratings.create({email : sess.email , ProductAsin : ProductAsin , rating:rating},(err,result)=>{
        if (err) throw err
        console.log(result);
        // alert-success
       res.render("alertsTemplate",{alertclass:'alert-success',alertMessage:'Thanks For Giving Review'});
        
      })
    })
    }
    
  })
  
})
router.get('/Uprofile' , (req , res) =>{
  res.render('./Auth/Uprofile',{sess:sess})
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

router.get('/product_Review' , (req, res) =>{
  res.render('./Auth/review',{sess:sess})
})


	
router.post('/review' , LoginCheck,(req,res,) =>{
  var temail = sess.email ;
  var titemid = req.body.item_id;
 review.findOne({$and:[{email:temail},{item_id:titemid}]})
  .then(preview =>{
    if(preview){
      // res.status(400).json('You have already reviewd Thanks and have nice day');
      res.render("alertsTemplate",{alertclass:'alert-warning',alertMessage:'You have already reviewd Thanks and have nice day'});
    
    }
    else{
      const{email , item_id , description} = req.body;
      review.create({email : email , item_id : item_id , description : description},(err,result)=>{
        if (err) throw err
        console.log(result);
      //  res.json("Thanks for your review");
      res.render("alertsTemplate",{alertclass:'alert-success',alertMessage:'Thanks for your review'});

        
      })
    }
  })  
});
router.get('/product_feedback',LoginCheck , (req , res) =>{
  res.render('./Auth/feedback',{sess:sess})
})
router.post('/feedback' ,(req,res,) =>{
  var temail = sess.email ;
  var titemid = req.body.item_id;
 feedback.findOne({$and:[{email:temail},{item_id:titemid}]})
  .then(preview =>{
    if(preview){
      // res.status(400).json('You have already given your feedback Thanks and have nice day');
      res.render("alertsTemplate",{alertclass:'alert-success',alertMessage:'Thanks for your Feedback'});
    
    }
    else{
      const{email , item_id , description} = req.body;
      feedback.create({email : email , item_id : item_id , description : description},(err,result)=>{
        if (err) throw err
        console.log(result);
      //  res.json("Thanks for your Feedback");
      res.render("alertsTemplate",{alertclass:'alert-success',alertMessage:'Thanks for your Feedback'});

        
      })
    }
  })  
});

router.get('/verify/email/:email',(req,res)=>{
  const email = req.params.email;
  tempuser.findOne({email:email},(err,data)=>{
    console.log(data)
 
    // tempuser.findByIdAndUpdate(data._id, { isverified:true },(err,done)=>
    // {
    //   if (err) throw err
    //   console.log(done);
    // })
      tempuser.updateOne(
      {email:data.email },
      // {_id:Mongoose.Types.ObjectId(data._id)},
      { $set: { isverified : true } },
      {upsert : true},(err,d)=>{
        if(err) throw err
        console.log(d)
      }
   );

  })
  // tempuser.save;
res.send("done")
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

router.get('/admin/dashboard',(req,res)=>{
  console.log(sess)
  if(sess.userType == 'admin' || sess.userType == 'Admin' ){
    tempuser.find({},(err,data)=>{
      res.render('./Admin/userlist',{data:data,sess:sess})
    })
  }
  else{
    res.redirect('/')
  
}
})


router.get('/seller/dashboard',LoginCheck,(req,res)=>{
  res.render('./Auth/sellerdashboard',{sess:sess})
  // res.send('sellerdashboard')

})
// var RatingData;
// above gloabal variable
router.get('/Seller/EditItems',(req,res)=>{
  // ratings.find({},(err,ratingdata)=>{
  //   RatingData = ratingdata;
  // })
  
  product.find({PostedByemail:sess.email},(err,data)=>{
  res.render('./Auth/sellerEditItems',{data:data,sess:sess})
  // res.send('sellerdashboard')
})
// console.log(RatingData);
})

// /seller/delete/product/<%= data._id %>
router.get('/seller/delete/product/:id',(req,res)=>{
  
  product.findByIdAndDelete(req.params.id,(err,data)=>{
    res.redirect('/Seller/EditItems')
  })
})
// seller/edit/product/6057675573b96110b4817e1d
router.get('/seller/edit/product/:id',(req,res)=>{
  product.findById({_id:req.params.id},(err,data)=>{
    res.render('./Auth/sellerproductedit',{data:data});
  })
})
router.post('/seller/edit/product/:id',(req,res)=>{
  const {keywords,Asin,Link,Store,option,Country,Amount,Amountperday,Price,OwnPart,Condition,RefundWithFeedback,allowedagenttakeselfpart,Refundinclfee,ReviewwithPic,Reviewwithvideo} = req.body;
  
  product.findByIdAndUpdate(req.params.id, { $set: {
    PostedBy:sess.Username,PostedByemail:sess.email,keywords:keywords,Asin:Asin,Link:Link,Store:Store,option:option,Country:Country,Amount:Amount,Amountperday:Amountperday,Price:Price,OwnPart:OwnPart,Condition:Condition,RefundWithFeedback:RefundWithFeedback,allowedagenttakeselfpart:allowedagenttakeselfpart,Refundinclfee:Refundinclfee,ReviewwithPic:ReviewwithPic,Reviewwithvideo:Reviewwithvideo
    
    }},(err,data)=>{
      err?console.log(err):res.redirect('/Seller/EditItems')
    })
})
router.post('/seller/add/product',(req,res)=>{
  const {keywords,Asin,Link,Store,option,Country,Amount,Amountperday,Price,OwnPart,Condition,RefundWithFeedback,allowedagenttakeselfpart,Refundinclfee,ReviewwithPic,Reviewwithvideo} = req.body;
 
 for(let i = 0;i <= Asin.length;i++){
   console.log(i)
 }
  product.insertMany({PostedBy:sess.Username,PostedByemail:sess.email,keywords:keywords,Asin:Asin,Link:Link,Store:Store,option:option,Country:Country,Amount:Amount,Amountperday:Amountperday,Price:Price,OwnPart:OwnPart,Condition:Condition,RefundWithFeedback:RefundWithFeedback,allowedagenttakeselfpart:allowedagenttakeselfpart,Refundinclfee:Refundinclfee,ReviewwithPic:ReviewwithPic,Reviewwithvideo:Reviewwithvideo},(err,data)=>{
    if (err) throw err
    res.redirect('/Seller/EditItems')
  })
})
router.get('/updateprofile',(req,res)=>{
  res.render('./Auth/profileupdate',{sess:sess})
})
router.post('/updateprofile' ,upload.single('profileimage'), (req , res) =>{
  console.log(req.body)
  const handleError = (err, res) => {
    // res
    //   .status(500)
    //   .contentType("text/plain")
    //   .end("Oops! Something went wrong!");
  };
console.log(req.file)
const tempPath = req.file.path;
const targetPath = path.join(__dirname, "./uploads/image.png");
console.log(tempPath,targetPath);
if (path.extname(req.file.originalname).toLowerCase() === '.jpg' || '.png') {
  fs.rename(tempPath, targetPath, err => {
    // if (err) return handleError(err, res);

    res
      .status(200)
      .contentType("text/plain")
      .end("File uploaded!");
  });
} else {
  fs.unlink(tempPath, err => {
    // if (err) return handleError(err, res);

    res
      .status(403)
      .contentType("text/plain")
      .end("Only .png files are allowed!");
  });
}
  // console.log(sess.email);

  // let upload = multer({ storage: storage }).single(req.body.profileimage);
  // upload(req, res, function(err) {
    // req.file contains information of uploaded file
    // req.body contains information of text fields, if there were any

//     if (req.fileValidationError) {
//         return res.send(req.fileValidationError);
//     }
//     else if (!req.file) {
//         return res.send('Please select an image to upload');
//     }
//     else if (err instanceof multer.MulterError) {
//         return res.send(err);
//     }
//     else if (err) {
//         return res.send(err);
//     }

//     // Display uploaded image for user validation
//     res.send(`You have uploaded this image: <hr/><img src="${req.file.path}" width="500"><hr /><a href="./">Upload another image</a>`);
// });

  tempuser.updateOne({email:sess.email,Username:sess.Username,userType:sess.userType} , {
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

router.get('/new',(req,res)=>{
  res.render('./new',{sess:sess})
})

router.post('/updateproduct' , (req , res) =>{
  
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
  // app.get('*', function(req, res){
    res.render('404');
  // });
})
module.exports = router;
