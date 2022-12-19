require("dotenv").config(); //configuring dotenvfile

const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encrypt");
const bcrypt=require("bcrypt")



const app = express();



app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("static_folder")) //for using static file ,keep in static_folder
// mongoose.set('strictQuery', true);


const url = "mongodb://localhost:27017/userDB";
mongoose.connect(url, { useNewUrlParser: true });

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



















const user = mongoose.model("user", userschema);

const document = new user({
  email: "gogo@gmail.com",
  password: "hackerbolte",
});

//messageschema

app.get("/", (req, res) => {
  res.render("home");
});


//register route

app.route("/register")
.get( (req, res) => {
  res.render("register");
})
.post((req, res) => {
  
  

  const saltRounds=10
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    // Store hash in your password DB.
    const newUser = new user({
        email: req.body.username,
        password: hash,
      });
      newUser.save((err, savedUser) => {
        if (!err) {
          console.log("user saved succesfully");
          
          res.render("secrets",{
            Allsecrets:savedUser.Allsecrets
          });
        }
      });


});


});





//login route



app.route("/login")
.get((req, res) => {
  res.render("login");
})
.post( (req, res) => {
    // res.render("secrets");
  
    user.findOne(
      { email: req.body.username },
      (err, foundUser) => {
        if (foundUser) {
            const saltRounds=10

            bcrypt.compare(req.body.password, foundUser.password, function(err, result) {
                // result == true
                if (result) {
                    res.render("secrets", {
                      Allsecrets: foundUser.Allsecrets,
                    });
                    
                  }else{
                    res.send("please enter correct password")
                  }
            });
           
          
        } else {
          res.send("please register yourself")
        }
      }
    );
  });




app.get("/submit", (req, res) => {
  res.render("submit");
});

app.get("/logout", (req, res) => {
  res.redirect("/login");
});

// app.post("/submit", (req, res) => {
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

//   // res.render('secrets')
//   //now we have to redirect to secret page of that user
// });

app.listen(3000, () => {
  console.log("server is running on port 3000");
});





