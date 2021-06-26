const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Schema definition
const userSchema = new Schema({
    firstName: 
    {
        type: String,
        required: true
    },
    lastName: 
    {
        type: String,
        required: true
    },
    email:
    {
        type: String,
        required: true,
        unique: true
    },
    password:
    {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now()
    }
});

//Password hashing
userSchema.pre("save", function(next) {
    var user = this;
    bcrypt.genSalt(10)
    .then((salt) => {
        // Hash the password, using the salt.
        bcrypt.hash(user.password, salt)
        .then((encrypted) => {
            user.password = encrypted;
            next();
        })
        .catch((err) => {
            console.log(`Error occured when hashing. ${err}`);
         });
    })
    .catch((err) => {
        console.log(`Error occured when salting. ${err}`);
     });
 });

const userModel = mongoose.model("Users", userSchema);

module.exports = userModel;