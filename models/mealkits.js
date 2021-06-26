const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Schema definition
const mealSchema = new Schema({
    name: 
    {
        type: String,
        required: true,
        unique: true
    },
    included: 
    {
        type: String,
        required: true
    },
    desc:
    {
        type: String,
        required: true,
    },
    category:
    {
        type: String,
        required: true
    },
    price:
    {
        type: Number,
        required: true,
    },
    cookTime:
    {
        type: Number,
        required: true
    },
    servings:
    {
        type: Number,
        required: true,
    },
    calories:
    {
        type: Number,
        required: true
    },
    imageUrl:
    {
        type: String,
    },
    topDish:{
        type: Boolean,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now()
    }
});

const mealModel = mongoose.model("Meals", mealSchema);

module.exports = mealModel;

module.exports.getMealByCategory = function (data) {
  var added = false;
  var selected = [];
  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < selected.length; j++) {
      if (data[i].category === selected[j].category) {
        added = true;
      }
    }
    if (added == false) {
      selected.push({ category: data[i].category, mealkits: [] });
    } else {
      added = false;
    }
    for (var j = 0; j < selected.length; j++) {
      if (data[i].category === selected[j].category) {
        selected[j]["mealkits"].push(data[i]);
      }
    }
  }
  return selected;
};

module.exports.getTopDishes = function(data) {
    var topDishes = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i].topDish) {
                topDishes.push(data[i]);
            }
        }
    return topDishes;
};

//static meals array
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
