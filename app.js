require("dotenv").config(); //configuring dotenvfile

const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encrypt");
const bcrypt=require("bcrypt")
//passport
const passport=require("passport")
const session=require("express-session")
const passport_local_mongoose=require("passport-local-mongoose")
//we dont need to require passport-local

const app = express();



app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("static_folder")) //for using static file ,keep in static_folder
// mongoose.set('strictQuery', true);

//setting up session
app.use(session({
    secret:"goga basant",
    resave:false,
    saveUninitialized:false
}))

//initialize passport
app.use(passport.initialize());
//use passport to setup session
app.use(passport.session());








const url = "mongodb://localhost:27017/userDB";
mongoose.connect(url, { useNewUrlParser: true });
// mongoose.set("useCreateIndex",true);

const messageSchema = new mongoose.Schema({
  secret: {
    type: String,
    required: true,
  },
});

const message = mongoose.model("message", messageSchema);

const secretMessage = new message({
  secret: "sawdee kaw happy now",
});

const userschema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
 Allsecrets: [messageSchema],
});

// var encKey = process.env.SOME_32BYTE_BASE64_STRING;
// var sigKey = process.env.SOME_64BYTE_BASE64_STRING;

// userschema.plugin(encrypt, {
//   encryptionKey: encKey,
//   signingKey: sigKey,
//   encryptedFields: ["password"],
// });


//to hash and salt password and save in userdb
userschema.plugin(passport_local_mongoose)




const user = mongoose.model("user", userschema);



//serialise user==>make cookie  
//deserialise user==>decrumble cookie and read data inside

passport.use(user.createStrategy());
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());




const document = new user({
  email: "gogo@gmail.com",
  password: "hackerbolte",
});

//messageschema

app.get("/", (req, res) => {
  res.render("home");
});


//secret route
app.get("/secrets",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("secrets")
    }else{
        res.render("secrets",{
                        Allsecrets:[]
                      });
    }
})

//register route

app.route("/register")
.get( (req, res) => {
  res.render("register");
})
.post((req, res) => {
  
  

//   const saltRounds=10
//   bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
//     // Store hash in your password DB.
//     const newUser = new user({
//         email: req.body.username,
//         password: hash,
//       });
//       newUser.save((err, savedUser) => {
//         if (!err) {
//           console.log("user saved succesfully");
          
//           res.render("secrets",{
//             Allsecrets:savedUser.Allsecrets
//           });
//         }
//       });


// });

    user.register({username: req.body.username},req.body.password,(err,user)=>{
            if(err){
                console.log(err);
                res.redirect("/register")
            }else{
                passport.authenticate("local")(req,res,()=>{
                    res.redirect("/secrets")
                })
            }
    })


});



//login route



app.route("/login")
.get((req, res) => {
  res.render("login");
})
.post( (req, res) => {
    // res.render("secrets");
  
    // user.findOne(
    //   { email: req.body.username },
    //   (err, foundUser) => {
    //     if (foundUser) {
    //         const saltRounds=10

    //         bcrypt.compare(req.body.password, foundUser.password, function(err, result) {
    //             // result == true
    //             if (result) {
    //                 res.render("secrets", {
    //                   Allsecrets: foundUser.Allsecrets,
    //                 });
                    
    //               }else{
    //                 res.send("please enter correct password")
    //               }
    //         });
           
          
    //     } else {
    //       res.send("please register yourself")
    //     }
    //   }
    // );
    const Newuser=new user({
        email:req.body.username,
        password:req.body.password
    })
    req.login(Newuser,(err)=>{
        if(!err){
            passport.authenticate("local")(req,res,()=>{
                res.redirect("/secrets")
            })
        }
    })


  });



//submit route
app.route("/submit")
.get((req, res) => {
  res.render("submit");
})
.post((req, res) => {
    console.log(req.user);
//   var content = req.body.secret;
//   var newSecret = new message({
//     secret: content,
//   });
//   newSecret.save();
//   user.findOneAndUpdate({ _id: userId }, (err, foundUser) => {
//     foundUser.Allsecrets.push(newSecret);
//     res.render("secrets", {
//       Allsecrets: foundUser.Allsecrets,
//     });
//   });

  // res.render('secrets')
  //now we have to redirect to secret page of that user
});




app.get("/logout", (req, res) => {
    req.logout();
  res.redirect("/login");
});



app.listen(3000, () => {
  console.log("server is running on port 3000");
});













