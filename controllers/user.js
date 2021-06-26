const express = require('express');
const bcrypt = require("bcryptjs");
const userModel = require('../models/user');
const router = express.Router();

// Route to our login page.
router.get("/login", (req, res) => {
    if(req.session.user){
        res.redirect("/dashboard/customer");
    }else{
        res.render('user/login',{
            title: "Login"
        });
    }
});

router.post("/login", (req, res) => {
    //console.log(req.body);

    let errorReturn = {};
    let valid = true;

    const {email, password, radiobtn} = req.body;
    //email validation
    if (email.length === 0) {
        errorReturn.email = "Please enter an email address."
        valid = false;
    }
    //password validation
    if (password.length === 0) {
        errorReturn.password = "Please enter a valid password."
        valid = false;
    }

    //Radiobtn validation
    if (radiobtn == null) {
        errorReturn.radiobtn = "Please select the type of account."
        valid = false;
    }

    if(valid){
        userModel.findOne({
            email: email
        })
        .then((user) => {
            if (user) {
                bcrypt.compare(password, user.password)
                .then((isMatched) => {
                    if (isMatched) {
                        req.session.user = user;
                        req.session.radiobtn = radiobtn; //so that route is only accessible according to the option chosen at login
                        if(radiobtn == "clerk"){ 
                            res.redirect("/dashboard/dataclerk");
                        }else{
                            res.redirect("/dashboard/customer");
                        }
                    }
                    else {
                        errorReturn.err = "The email/password is incorrect, please try again.";
                        res.render("user/login", {
                            title: "Login",
                            check: errorReturn,
                            values: req.body
                        });
                    }
                })
                .catch((err) => {
                    console.log(`Error comparing passwords: ${err},`);
                    errorReturn.err = "Something unexpected has occurred, Please try again!";
                    res.render("user/login", {
                        title: "Login",
                        check: errorReturn,
                        values: req.body
                    });
                });
            }
            else {
                // User was not found in the database.
                errorReturn.err = "The email/password is incorrect, please try again.";
                res.render("user/login", {
                    title: "Login",
                    check: errorReturn,
                    values: req.body
                });
            }
        })
        .catch((err) => {
            console.log(`Error finding the user from the database: ${err},`);
            errorReturn.err = "Something unexpected has occurred, Please try again!";
            res.render("user/login", {
                title: "Login",
                check: errorReturn,
                values: req.body
            });
        });
    }
    else{
        res.render("user/login", {
            title: "Login",
            check: errorReturn,
            values: req.body
        });
    }

});

// Route to our registration page.
router.get("/signup", (req, res) => {
    if(req.session.user){
        res.redirect("/dashboard/customer");
    }else{
        res.render('user/signup',{
            title: "Sign Up"
        });  
    }
});

router.post("/signup", (req, res) => {
    //console.log(req.body);

    let errorReturn = {};
    let valid = true;

    const {fName, lName, email, password} = req.body;
    
    const user = new userModel({
        firstName: fName,
        lastName: lName,
        email: email,
        password: password
    });

    //email validation
    if (email.length === 0) {
        errorReturn.email = "Please enter an email address."
        valid = false;
    }
    else if(email.length > 5){
        const match = RegExp(/[\da-zA-Z]+@[\da-zA-Z]+\.[a-zA-Z]/);
        if(!match.test(email)){
            errorReturn.email = "Please enter a valid email address."
            valid = false;
        }
    }

    //password validation
    if (password.length === 0) {
        errorReturn.password = "Please enter a password."
        valid = false;
    }
    else if(password.length <= 12 && password.length >= 6){
        //Regular expression taken from https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a
        const match = RegExp(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)/);
        if(!match.test(password)){
            errorReturn.password = "Password must contain at least one number, uppercase letter, lowercase letter and symbol."
            valid = false;
        }
    }
    else{ 
        errorReturn.password = "Password must be between 6-12 characters."
        valid = false;
    } 
    //name validation
    if (fName.length === 0) {
        errorReturn.fName = "Please enter a first name."
        valid = false;
    }

    if(lName.length === 0){
        errorReturn.lName = "Please enter a last name."
        valid = false;
    }

    userModel.findOne({email:email})
    .then((exists) => {
        if(exists){
            errorReturn.email = "Email already exists";
            res.render("user/signup", {
                title: "Sign Up",
                check: errorReturn,
                values: req.body
            });
        }else{
            if(valid)
            {
                user.save()
                .then((saved) => {
                // User was saved correctly.
                //console.log(`User ${saved.firstName} has been saved to the database.`);
                    req.session.user = user;
                    req.session.radiobtn = "customer";

                    const sgMail = require("@sendgrid/mail");
                    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            
                    const msg = {
                        to: email,
                        from: "fmohammad15@myseneca.ca",
                        subject: "Welcome to Foodiez",
                        html:
                            `Hey ${fName} ${lName},<br>
                            Welcome to the Foodiez family, here is hoping our services meet your needs.<br><br>
                            Thank you for joining us!<br> Mohammad Fuhad Uddin, Foodiez<br>`
                    };
            
                    sgMail.send(msg)
                    .then(() => {
                        res.redirect("/welcome");
                    })
                    .catch(err => {
                        console.log(`Error ${err}`);
                        errorReturn.err = "Something unexpected has occurred, Please try again!";
                        res.render("user/signup",{
                            title: "Sign Up",
                            check: errorReturn
                        });
                    });
                        
                })
                .catch((err) => {
                    console.log(`Error adding user to the database.  ${err}`);
                    errorReturn.err = "Something unexpected has occurred, Please try again!";
                    res.render("user/signup",{
                        title: "Sign Up",
                        check: errorReturn
                    });
                });
            }
            else{
                res.render("user/signup", {
                    title: "Sign Up",
                    check: errorReturn,
                    values: req.body
                });
            }
        }
    })
    .catch((err) => {
        console.log(`Error finding user in the database. ${err}`);
        errorReturn.err = "Something unexpected has occurred, Please try again!";
        res.render("user/signup",{
            title: "Sign Up",
            check: errorReturn
        });
    });
});

// Set up logout page
router.get("/logout", (req, res) => {
    // Clear the session from memory.
    req.session.destroy();
    res.redirect("/user/login");
});


module.exports = router;