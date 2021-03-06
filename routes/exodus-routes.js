// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================

// Requiring our models
var db = require("../models");

// Routes
// =============================================================
module.exports = function(app) {

  // GET route for getting all of the posts
  app.get("/users", function(req, res) {

    db.User.findAll().then(function(dbUser) {
      var hbsObject = {
        users: dbUser
      };
      console.log(hbsObject);
      // res.json(dbUser);
      res.render("users", hbsObject);
    });
  });



  // ------Twilio Sending initial text message.
  // Once the user responds with a text, the serverTextMessage.js file will send the user a reply
  // twilio account login. email: m11farrelly@gmail.com password: gwbootcamptest
var client = require('twilio')('AC754877e3fb03a0cd449bff55e9fcfea9', 'f33a199e73ca24323a8a898629b69adb');

  app.get("/sendText", function(req, res){    
    console.log(req.query.message);
    db.User.findAll(
      {
        attribute: ['phone_number'],
        where: {contact_list: req.query.contactList, contact_mode: 'Text'}
      }).then(function(dbUser){
      for(var i = 0; i < dbUser.length; i++){
        client.messages
        .create({        
          to: '+1' + dbUser[i].phone_number,  // User Number(s) input textTo array here
          from: '+12028739354', // Twilio Number
          body: req.query.message,
        }, function(err, data) {
          if (err) {
            console.log(err);
            console.log(data);
          };
        });
      };
      res.json(dbUser);      

  });
});
// -----Twilio


  app.get("/email/api/send", function(req, res){
    db.User.findAll(
      {
        attribute: ['email_address'],
        where: {contact_list:req.query.contactList, contact_mode: 'Email'}
      }).then(function(dbUser){
      
      var emailTo = [];

      for(var i = 0; i < dbUser.length; i++){
        emailTo.push(dbUser[i].email_address);
      }

      var nodemailer = require('nodemailer');
      var path = require('path');
      var fs = require('fs')
      
      var template = fs.readFileSync(path.join(__dirname, "../templates/" + req.query.emailTemplate + ".html"))
      
      var fromEmail = 'exoduscrmtest@gmail.com'; // add email of the gmail you are sending from
      var password =  'exodustest'  // add gmail password
      
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: fromEmail,
          pass: password
        }
      });
      
      var mailOptions = {
        from: fromEmail,
        to: emailTo,
        subject: 'Test Email',
        html: template
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      res.json(emailTo);
    });
  });

  // Get rotue for retrieving a single user
  app.get("/users/:id", function(req, res) {

    db.User.findOne({
      where: {
        id: req.params.id
      }
    }).then(function(dbUser) {
      res.json(dbUser);
    });
  });

  // POST route for saving a new user
  app.post("/users", function(req, res) {
    db.User.create(req.body).then(function(dbUser) {
      res.json(dbUser);
    });
  });

  // DELETE route for deleting users
  app.delete("/users/:id", function(req, res) {
    db.User.destroy({
      where: {
        id: req.params.id
      }
    }).then(function(dbUser) {
      res.json(dbUser);
    });
  });

  // PUT route for updating users
  app.put("/users", function(req, res) {
    db.User.update(
      req.body,
      {
        where: {
          id: req.body.id
        }
      }).then(function(dbUser) {
        res.json(dbUser);
      });
  });
};
