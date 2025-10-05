const mongoose = require("mongoose");
const { type } = require("os");
// Define the Person schema
const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  party:{
    type:String,
    required:true
  },
  age:{
    type:String,
    required:true
  },
  votes:[
    {
        user:{
            type: mongoose.Schema.Types.ObjectId, //here store every users mongodb id  which is uniqe.
            ref:'user', //which table will the data come from?
            required:true
        },
        voteAt:{
            type:Date, //when user voted
            default:Date.now() //it added the date and time also
        }
    }
  ],
  voteCount:{
    type:Number,
    default:0
  }

});


// Create model
const candidate = mongoose.model("candidate", candidateSchema);
module.exports = candidate;
