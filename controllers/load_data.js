const express = require('express');
const router = express.Router();
const mealModel = require('../models/mealkits');
const path = require("path");

var meals = [
    {
        name: "Chicken Quinoa",
        included: "With Kale and Beans",
        desc: "An adequate meal consisting of all the carbs, fibre and protein you need.",
        category: "Lunch Meal",
        price: 18.99,
        cookTime: 30,
        servings: 2,
        calories: 850,
        imageUrl: '/images/meals/meal1.jpg',
        topDish: true
    },
    {
        name: "Coconut-Tamari Soup",
        included: "With Mushrooms",
        desc: "Light vegan soup with a touch of coconut.",
        category: "Lunch Meal",
        price: 16.99,
        cookTime: 25,
        servings: 4,
        calories: 550,
        imageUrl: '/images/meals/meal2.jpg',
        topDish: true
    }, 
    {
        name: "Farfalle Pasta",
        included: "With Tomatoes and Spinach",
        desc: "Farfalle also referred to as the bow tie pasta, taste the sauce with each bite.",
        category: "Lunch Meal",
        price: 14.99,
        cookTime: 30,
        servings: 2,
        calories: 750,
        imageUrl: '/images/meals/meal4.jpg',
        topDish: false
    }, 
    {
        name: "Fruity Smoothie Bowl",
        included: "With Goji, Nuts and Bananas",
        desc: "Quick smoothie bowl with a balanced mix of fruits and nuts.",
        category: "Breakfast Meal",
        price: 7.99,
        cookTime: 15,
        servings: 1,
        calories: 550,
        imageUrl: '/images/meals/meal5.jpg',
        topDish: false
    },
    {
        name: "Flank Steak Tagliata",
        included: "With Arugula and Parmesan",
        desc: "One of the leanest cuts of meat paired with the right ingredients that favour the flavour.",
        category: "Lunch Meal",
        price: 15.99,
        cookTime: 35,
        servings: 1,
        calories: 1100,
        imageUrl: '/images/meals/meal3.jpg',
        topDish: true
    }
];

router.get("/meal-kits", (req, res) => {  
    if(req.session && req.session.radiobtn == 'clerk'){
        mealModel.collection.countDocuments({}, (err, count) => {
            if (err) {
                res.render("general/load-data",{
                    title: "Load-Data",
                    msg: err
                })
            }
            else if (count === 0) {
                mealModel.collection.insertMany(meals, (err, docs) => {
                    if (err) {
                        res.render("general/load-data",{
                            title: "Load-Data",
                            msg: err
                        })
                    }
                    else {
                        res.render("general/load-data",{
                            title: "Load-Data",
                            msg: "Added meal kits to the database."
                        })
                    }
                });
            }
            else {
                res.render("general/load-data",{
                    title: "Load-Data",
                    msg: "Meal kits have already been added to the database."
                })
            }
        });
    }else{
        res.render("general/load-data",{
            title: "Load-Data",
            msg: "You are not authorized to add meal kits."
        })
    }
});

module.exports = router;