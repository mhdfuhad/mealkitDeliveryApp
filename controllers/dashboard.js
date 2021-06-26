const express = require('express');
const mealModel = require('../models/mealkits');
const router = express.Router();
const path = require("path");

// Route to our customer dashboard page.
router.get("/customer", (req, res) => {
    if(req.session.user){
        if(req.session.radiobtn == "customer"){ //if login as customer was chosen only customer profile dashboard will be accessible
            var cart = req.session.cart || [];
            var cartTotal = "0.00";
            var cartQty = 0;

            const hasMeals = Array.isArray(cart) && cart.length > 0;
            if (hasMeals) {
                cartTotal = 0;
                cart.forEach(mealkit => {
                    cartTotal += (mealkit.meal.price * mealkit.qty);
                    cartQty += mealkit.qty;
                });
            }

            res.render('dashboards/cust_profile',{
                title: "Profile",
                cart: cart,
                total: parseFloat(cartTotal).toFixed(2),
                qtyTot: cartQty,
                message: req.session.message
            });
            req.session.message = null;
            
        }else if(req.session.radiobtn == "clerk"){ //if login as data clerk was chosen then redirects to that route
            res.redirect("/dashboard/dataclerk");
        }
    }else{
        res.redirect("/user/login");
    }
});

router.post("/customer",(req,res)=>{
    var cart = req.session.cart || [];
    const hasMeals = Array.isArray(cart) && cart.length > 0;

    if(hasMeals){
        var cartTotal = req.body.order; 
        var qtyTot = req.body.qty;
        var string = [];
        //Creates a string with all meals concatenated for the email
        cart.forEach(mealkit =>{
            string.push(`<div><div> ${mealkit.qty} of ${mealkit.meal.name}</div> <div>$${mealkit.meal.price} each</div></div><br>`);
        }) 
        string = string.join('');


        const sgMail = require("@sendgrid/mail");
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const msg = {
            to: req.session.user.email,
            from: "fmohammad15@myseneca.ca",
            subject: "Order Summary",
            html:
                `Hey ${req.session.user.firstName} ${req.session.user.lastName},<br>
                Thank you for placing an order with Foodiez, here are the meals you have ordered.<br><br>
                ${string}
                <div><b>Order Total <div>Quantity: ${qtyTot}</div> <div>Price: $${cartTotal}</div></b></div>`
                
        };

        sgMail.send(msg)
        .then(() => {
            req.session.cart = [];
            req.session.message = "Your order has been placed!";
            res.redirect("/dashboard/customer");
        })
        .catch(err => {
            console.log(`Error ${err}`);
        });
    }else{
        req.session.message = "Cart is Empty!";
        res.redirect("/dashboard/customer");
    }

});

// Route to our data clerk dashboard page.
router.get("/dataclerk", (req, res) => {
    if(req.session.user){
        if(req.session.radiobtn == "clerk"){
            var errs = {};
            if(req.session.imgError){
                errs.imgErr = "The file type is not supported please update the meal with a supported type.";
            }else if(req.session.dataReq){
                errs.dataErr = "All fields required, image is an exception.";
            }
            mealModel.find()
            .exec()
            .then((data) => {
                data = data.map(value => value.toObject());
                req.session.imgError = false;
                req.session.dataReq = false;
                res.render('dashboards/clerk_profile',{
                    title: "Profile",
                    meals: data,
                    errors: errs
                });
            })
            .catch((err) => {
                console.log(`Error ${err},`);
            });
        }else if(req.session.radiobtn == "customer"){
            res.redirect("/dashboard/customer");
        }
    }else{
        res.redirect("/user/login");
    }
});

router.post("/dataclerk", (req, res) => {
    mealModel.find()
    .exec()
    .then((data) => {
        data = data.map(value => value.toObject());
        if(req.body.edit){
            mealModel.findOne({
                _id: req.body.edit
            })
            .exec()
            .then((meal) => {
                res.render('dashboards/clerk_profile',{
                    title: "Profile",
                    meals: data,
                    doc: meal
                });
            })
            .catch((err)=>{
                console.log(`Error occured finding meal. ${err}`);
                res.redirect("/dashboard/dataclerk");
            });
        }else{
            res.render('dashboards/clerk_profile',{
                title: "Profile",
                meals: data,
            });
        }
    })
    .catch((err) => {
        console.log(`Error occured finding meals. ${err}`);
        res.redirect("/dashboard/dataclerk");
    });
    
});

//Add meal route
router.post("/addMeal", (req, res) => {
    const {name, included, category, desc, price, cookTime, servings, calories, topDish } = req.body
    if(name && included && category && desc && price && cookTime && servings && calories){
        const meal = new mealModel({
            name: name,
            included: included,
            category: category,
            desc: desc,
            price: price,
            cookTime: cookTime,
            servings: servings,
            calories: calories,
            topDish: topDish
        });

        //console.log(meal);
        meal.save()
        .then((mealSaved) => {
            if(req.files){
                const extention = path.parse(req.files.imageUrl.name).ext.toUpperCase();
                if(extention != '.PNG' && extention != ".GIF" && extention != ".JPG"){
                    req.session.imgError = true;
                    res.redirect("/dashboard/dataclerk");
                }else{
                    console.log(`Meal ${mealSaved.name} has been saved to the database.`);
                    req.files.imageUrl.name = `meal_pic_${mealSaved._id}${path.parse(req.files.imageUrl.name).ext}`;
                    req.files.imageUrl.mv(`public/images/meals/${req.files.imageUrl.name}`)
                    .then(() => {
                        mealModel.updateOne({
                            _id: mealSaved._id
                        }, {
                            imageUrl: `/images/meals/${req.files.imageUrl.name}`
                        })
                        .then(() => {
                            res.redirect("/dashboard/dataclerk");
                        })
                        .catch((err) => {
                            console.log(`Error updating the mealkit.  ${err}`);
                            res.redirect("/dashboard/dataclerk");
                        });
                    })
                    .catch((err) => {
                        console.log(`Error updating the mealkit.  ${err}`);
                        res.redirect("/dashboard/dataclerk");
                    });
                }
            }else{
                res.redirect("/dashboard/dataclerk");
            }
        })
        .catch((err) => {
            console.log(`Error adding meal to the database.  ${err}`);
            res.redirect("/dashboard/dataclerk");
        });
    }else{
        req.session.dataReq = true;
        res.redirect("/dashboard/dataclerk");
    }
});

//Update Meal Route
router.post("/updateMeal", (req, res) => {
    mealModel.updateOne({
        _id: req.body._id
    }, {
        $set: {
            name: req.body.name,
            included: req.body.included,
            category: req.body.category,
            desc: req.body.desc,
            price: req.body.price,
            cookTime: req.body.cookTime,
            servings: req.body.servings,
            calories: req.body.calories,
            topDish: req.body.topDish
        }
    })
    .exec()
    .then(() => {
        //console.log("Successfully updated meal: " + req.body.name);
        if(req.files){
            const extention = path.parse(req.files.imageUrl.name).ext.toUpperCase();
            if(extention != '.PNG' && extention != ".GIF" && extention != ".JPG"){
                req.session.imgError = true;
                res.redirect("/dashboard/dataclerk");
            }
            else{
                req.files.imageUrl.name = `meal_pic_${req.body._id}${path.parse(req.files.imageUrl.name).ext}`;
                req.files.imageUrl.mv(`public/images/meals/${req.files.imageUrl.name}`)
                var url = `/images/meals/${req.files.imageUrl.name}`
                mealModel.updateOne({
                    _id: req.body._id
                }, {    
                    $set: {
                        imageUrl: url
                    }
                })
                .exec()
                .then(() => {
                    //console.log("Successfully updated image: " + req.body.name);
                    res.redirect("/dashboard/dataclerk");
                })
                .catch((err) => {
                    console.log(`Error updating the mealkit.  ${err}`);
                    res.redirect("/dashboard/dataclerk");
                });
            }
        }else{
            res.redirect("/dashboard/dataclerk");
        }
    })
    .catch((err) => {
        console.log(`Error updating the mealkit.  ${err}`);
        res.redirect("/dashboard/dataclerk");
    });
});

//Delete Meal route
router.post("/deleteMeal", (req, res) => {
    mealModel.deleteOne({
        _id: req.body.delete
    })
    .exec()
    .then(() => {
        //console.log("Meal Deleted")
        res.redirect("/dashboard/dataclerk");
    })
    .catch((err)=>{
        console.log(`Error occured deleting meal ${err}`);
        res.redirect("/dashboard/dataclerk");
    });
});

module.exports = router;