require("dotenv").config(); //configuring dotenvfile

const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const ejs = require("ejs");
const { urlencoded } = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encrypt");
const bcrypt=require("bcrypt")
//passport
const passport=require("passport")
const session=require("express-session")
const findOrCreate = require('mongoose-findorcreate')
const passport_local_mongoose=require("passport-local-mongoose")
//we dont need to require passport-local

//GoogleStrategy
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = express();



app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("static_folder")) //for using static file ,keep in static_folder
// mongoose.set('strictQuery', true);

//setting up session
app.use(session({
    secret:"goga basant",
    resave:false,
    saveUninitialized:false,
    cookie: { secure: false }
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
  email: String,
  password: String,
  googleId:String,
  secret: [type=String],
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
userschema.plugin(findOrCreate);



const user = mongoose.model("user", userschema);



//serialise user==>make cookie  
//deserialise user==>decrumble cookie and read data inside

// passport.use(new LocalStrategy(User.authenticate()));
passport.use(user.createStrategy());

// passport.serializeUser(user.serializeUser());
// passport.deserializeUser(user.deserializeUser());

passport.serializeUser(function(user, done) {
 done(null,user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    user.findById(id,(err,user)=>{
        done(err,user);
    })
  });




// Configure Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    user.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));



const document = new user({
  email: "gogo@gmail.com",
  password: "hackerbolte",
});

//messageschema

app.get("/", (req, res) => {
  res.render("home");
});
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

//redirect url

app.get('/auth/google/secrets', 
//authenticate localy and saving there sessions
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

//secret route
app.get("/secrets",(req,res)=>{
    user.find({"secret": {$ne: null}}, function(err, foundUsers) {
        if(err){
          console.log(err);
        }else{
          if(foundUsers){
            res.render("secrets", {usersWithSecrets: foundUsers});
          }
        }
      });
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
  res.render("login", {invalidLogin: false});
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
    req.login(user, function(err){
        if(err){
          console.log(err);
        }else{
          passport.authenticate('local', function(err, user) {
            if (err) { return next(err); }
            if (!user) { return res.render('login', {invalidLogin: true}); }else{
              return res.redirect('/secrets');
            }
            
          })(req, res, function () {
          });
        }
      });


  });



//submit route
app.route("/submit")
.get((req, res) => {
    if(req.isAuthenticated()){
        res.render("submit"); 
      }else{
        res.redirect("/");
      }
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

console.log(req.user);
  const submittedSecret = req.body.secret;
  user.findById(req.user.id, function (err, foundUser) {
    if(err){
      console.log(err);
    }else{
      if(foundUser){
        foundUser.secret.push(submittedSecret);
        foundUser.save(function() {
          res.redirect("/secrets");
        });
      }
    }
  });
});




app.get("/logout", (req, res) => {
  //   req.logout();
  // res.redirect("/");
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});



app.listen(3000, () => {
  console.log("server is running on port 3000");
});













