const express = require('express');
const router = express.Router();
const mealData = require("../models/mealkits");


// Route to our homepage.
router.get("/", (req, res) => {
    mealData.find()
    .exec()
    .then((data) => {
        data = data.map(value => value.toObject());
        res.render('general/home', {
            title: "Home", 
            top: mealData.getTopDishes(data)
        });
    })
    .catch((err) => {
        console.log(`Error ${err},`);
    });
});

 // Route to our on the menu page.
 router.get("/onthemenu", (req, res) => {
    mealData.find()
    .exec()
    .then((data) => {
        data = data.map(value => value.toObject());

        res.render('general/onthemenu', {
            title: "On the Menu", 
            foods: mealData.getMealByCategory(data),
            message: req.session.message
        });
        req.session.message = null;
    })
    .catch((err) => {
        console.log(`Error ${err},`);
    });
});

// Route to our welcome page.
router.get("/welcome", (req, res) => {
    if(req.session.user){
        res.render('general/welcome',{
            title: "Welcome",
        });
    }else{
        res.redirect('/');
    }
});

//Route to our description page.
router.get("/description/:id", (req, res) => {
    const id = req.params.id;
    
    mealData.findOne({ _id: id })
    .exec()
    .then((data) => {
        res.render('general/description', {
            title: data.name, 
            meal: data,
            message: req.session.message
        });
        req.session.message = null;
    })
    .catch((err) => {
        console.log(`Error ${err},`);
        res.redirect("/onthemenu");
    });
});

//To add to cart
router.get("/addtoCart/:page/:id", (req, res) => {
    if(req.session.user && req.session.radiobtn == "customer"){
        const page = req.params.page; //use this
        const id = req.params.id;
        var cart = req.session.cart = req.session.cart || [];

        mealData.findOne({ _id: id })
        .exec()
        .then((data) => {
            if(data){
                var incart = false;

                cart.forEach(meal => {
                    if (meal._id == data._id) {
                        meal.qty++;
                        incart = true;
                    }
                });

                if(incart){
                    req.session.message = "Quantity increased!"
                    if (page == "otm"){
                        res.redirect(`/onthemenu`)
                    }else if(page == "cart"){
                        res.redirect(`/dashboard/customer`)
                    }else{
                        res.redirect(`/description/${id}`)
                    }
                }
                else{
                    cart.push({
                        _id: data._id,
                        qty: 1,
                        meal: data
                    });
                    cart.sort((a, b) => a.meal.name.localeCompare(b.meal.name));
                    req.session.message = "Added to cart!"
                    if (page == "otm"){
                        res.redirect(`/onthemenu`)
                    }else if(page == "cart"){
                        res.redirect(`/dashboard/customer`)
                    }else{
                        res.redirect(`/description/${id}`)
                    }
                }
            }else{
                req.session.message = "Could not find meal in database!"
                if (page == "otm"){
                    res.redirect(`/onthemenu`)
                }else if(page == "cart"){
                    res.redirect(`/dashboard/customer`)
                }else{
                    res.redirect(`/description/${id}`)
                }
            }
        })
        .catch((err) => {
            console.log(`Error ${err},`);
            req.session.message = "Error fetching meal from database!"
            if (page == "otm"){
                res.redirect(`/onthemenu`)
            }else if(page == "cart"){
                res.redirect(`/dashboard/customer`)
            }else{
                res.redirect(`/description/${id}`)
            }
        });
    }
    else{
        res.redirect("/user/login");
    }
});


//To remove from cart
router.get("/removefromCart/:opt/:id", (req, res) => {
    if(req.session.user && req.session.radiobtn == "customer"){
        const id = req.params.id;
        const opt = req.params.opt;
        var cart = req.session.cart || [];
        const index = cart.findIndex((mealkit) => { return mealkit._id == id });

        if (index >= 0) {
            if(cart[index].qty != 1 && opt == "remove"){ 
                cart[index].qty -= 1;
                req.session.message="Meal reduced!"
                res.redirect("/dashboard/customer");
            }else{
                cart.splice(index,1);
                req.session.message="Meal removed!"
                res.redirect("/dashboard/customer");
            }
        }
        else {
            req.session.message="Could not find meal in cart!"
            res.redirect("/dashboard/customer");
        }
    }
    else{
        res.redirect("/user/login");
    }
});

module.exports = router;