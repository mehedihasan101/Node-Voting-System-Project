const express =require('express'); 
const router=express.Router(); 
const user=require('../models/user.js'); 
const  {jwtAuthMiddleware,generateToken}=require('../jwt.js'); 



// add the person with jwt token system
router.post("/signup", async (req, res) => {
  console.log("POST /user hit");
  console.log("Body received:", req.body);

  try {
    const newPerson = new user(req.body); //here req.body is persons data
    const savedPerson = await newPerson.save(); //save the data object into database
    console.log("Data saved:", savedPerson);

    //jwt token part
    // only include safe fields (not password)
    const token = generateToken({ id: savedPerson._id, nidCardNumber: savedPerson.nidCardNumber });
    console.log("Token is: ",token); 


    res.status(201).json({
      message: "user created successfully!",
      person: savedPerson,
       token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//add login with token system
router.post("/login", async (req, res) => {
  try {
    // Extract email and password from request body
    const { nidCardNumber, password } = req.body;

    // 1. Find the user in database or not 
    const isUser = await user.findOne({ nidCardNumber });
    if (!isUser) {
      return res.status(401).json({ error: "Invalid Nid or password" });
    }

    // 2. Compare password with hashed password 
    const isMatch = await isUser.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid Nid or password" });
    }

    // 3. Generate token
    const token = generateToken({ id: isUser._id, nidCardNumber: isUser.nidCardNumber });

    // 4. Respond
    res.json({
      message: "Login successful",
      token,
      user: {
        id: isUser._id,
        name: isUser.name,
        nidCardNumber: isUser.nidCardNumber,
      },
    });
  } catch (err) {
    console.error("Login error: ", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



// Get person by token (protected route)
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    // `req.user` was set in jwtAuthMiddleware after verifying the token
    const userData = req.user;

    // Extract email (or id) from decoded token
    const userId = userData.id;

    // Find the user in DB
    const isUser = await user.findById(userId);
    if (!isUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Respond with profile info
    res.json({isUser});

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


//user can chage his password
router.put('/profile/password',jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user ;  // extract the id from token
        const {currentpassword,newPassword}=req.body //extract the current and new password from the req/url body 

        //find the user by userID
        const findUser=await user.findById(userId); 
        
        // 2. Compare password with hashed password 
    const isMatch = await findUser.comparePassword(currentpassword);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid  password" });
    }

    //update the user password
    findUser.password = newPassword;
    await findUser.save();

        res.status(200).json({message: 'password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});





module.exports=router; 