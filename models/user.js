const mongoose = require("mongoose");
const { type } = require("os");
// Define the Person schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number
  },
 email:{
    type: String,
    required:true
 },
 mobile:{
    type:String
 },
 address:{
    type:String,
    required:true
 },
 nidCardNumber:{
    type:Number,
    required:true,
    unique: true
 },
 password:{
    type:String,
    required:true
 },
 role:{
    type:String,
    enum:['voter','admin'],
    default:'voter'
 },
 isVoted:{
    type:Boolean,
    default:false
 }

});


userSchema.pre('save',async function(next) {
  const user=this; 

  //hash the password only if it has been modifyed (old hassed password or not hassed password seta check korbe)
  if(!user.isModified('password')) return next(); 

  try{
    //hash salt generation
    const salt=await bcrypt.genSalt(10); 

    //hash the password 
    const hashedPassword= await bcrypt.hash(user.password,salt); 

    //ovveride the plain password with the hashed one
    user.password= hashedPassword; 

    next(); 

  }catch(err){
    return next(); 
  }
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  try{
    //use bcrypct to compare the password with hashed password
    const isMatch=await bcrypt.compare(candidatePassword,this.password) ;
    return isMatch;
  }catch(err){
    throw err; 
  }
}


// Create model
const user = mongoose.model("user", userSchema);
module.exports = user;
