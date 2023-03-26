const {User} = require('../models/user');
const express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const secret = 10
//get a list of users
router.get(`/list`, async (req, res) =>{
    try{
        const userList = await User.find().select("-passwordHash -__v");

        if(!userList) {
            return res.status(500).json({success: false})
        }
        res.send(userList);}
    catch(err){
        console.log(err)
        res.status(500).json({ error: err.message });
    }
})

router.get(`/`, (req, res)=>{
    res.send("This is the user")
})

//post a new user
// router.post(`/register`, async(req, res) => {
//     const existingUser = await User.find({email: req.body.email})

//     if(existingUser)
//     return res.status(400).send("The user exists")

//     let newUser = new User({
//         name: req.body.name,
//         email: req.body.email,
//         passwordHash: bcrypt.hashSync(req.body.password, secret),
//         phoneNumber: req.body.phoneNumber,
//         location: req.body.location
//     })

//     let user = await newUser.save();

//     if(!user){
//         return res.status(400).send("The user cannot be created")
//     }

//     res.send(user).status(200);
// })

router.post('/register', async (req, res) => {
  try {
    // Extract the user data from the request body
    const { name, password, phoneNumber } = req.body;
    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(200).json({ success: false, message: 'A user with this phone Number already exists' });
    }
    // Create a new user object
    const user = new User({
      name,
      passwordHash: await bcrypt.hashSync(password, secret),
      phoneNumber,
    });
    // Save the user to the database
    await user.save();
    // Respond with a success message
    return res.status(201).json({success: true, message: 'User registered successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

//login user
router.post(`/login`, async(req, res)=>{
    try{
        const user = await User.findOne({phoneNumber: req.body.phoneNumber})
        if(!user){
            return res.status(401).json({success: false, message:"The user does not exist"})
        }
        
        if(user && await bcrypt.compareSync(req.body.password, user.passwordHash)){
            const token = jwt.sign({
                userId: user.id,
            }, `${secret}`,
            {expiresIn: '1m'});
            res.status(200).json({ userName: user.name, token : token, id: user.id});
        }else{
            res.status(401).json({success: false, message: "The password is wrong"})
        }
    }catch(err){res.status(500).json({message: err.message})}
})

// router.post('/login', async (req, res) => {
//     try {
//       // Find the user by their email address
//       const user = await User.findOne({ email: req.body.email });
//       if (!user) {
//         return res.status(404).json({ message: 'User not found' });
//       }
  
//       // Compare the provided password with the hashed password in the database
//       const isPasswordValid = await bcrypt.compareSync(req.body.password, user.passwordHash);
//       if (!isPasswordValid) {
//         return res.status(401).json({ message: 'Invalid email or password' });
//       }
  
//       // Create a JWT and send it back to the client
//       const token = jwt.sign({ user: user.id }, secret, { expiresIn: '1m' });
//       res.status(200).json({ token: token, user:user });
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   });
  

//update user
router.put(`/:id`, async(req, res)=>{
    try{
        const updateUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                email: req.body.email,
                passwordHash: bcrypt.hashSync(req.body.password, `${secret}`),
                phoneNumber: req.body.phoneNumber,
                location: req.body.location
            },{
                new: true,
            }
        )
        if(!updateUser)
        return res.status(400).send("The product cannot be created!")
    
        res.status(200).send(updateUser);
    }catch(err){
        console.log(err)
        res.status(500).json({ message: err.message });
    }
})

//delete user
router.delete(`/:id`, (req, res)=>{
    try{
        User.findByIdAndRemove(req.params.id).then(user=>{
            if(user){
                return res.status(200).json({success: true, message: "The user has been deleted"});
            }else{
                return res.status(404).json({success: false, message: "The user has not been deleted"})
            }
        }).catch(err=>{
            return res.status(400).json({success: false, error: err})
        })
    }catch(err){
        return res.status(500).json({ message: err.message });
    }
})

//count
router.get(`/count`,async(req, res)=>{
    try{
        const userCount = await User.countDocuments();

        if(!userCount){
            return res.status(500).json({success: false})
        }

        res.send({
            userCount: userCount
        })
    }catch(err){
        console.log(err)
        res.status(500).json({ error: err.message });
    }
})

module.exports =router;