const express = require('express');
const router = express.Router();
require('dotenv/config');
const multer  = require('multer')

const {Product} = require('../models/product');
const { User } = require('../models/user');
const {Size} = require('../models/size');

const FILE_TYPE_MAP = {
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isvalid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Invalid image type')

        if(isvalid){
            uploadError = null
        }
      cb(uploadError, './public/uploads')
    },
    filename: function (req, file, cb) {
      const fileName = file.originalname.split(' ').join('-');
      const extension = FILE_TYPE_MAP[file.mimetype];
      cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
})

const uploadOptions = multer({ storage: storage })

//get a list of products
router.get(`/list`, async (req, res) =>{
    try{
        const productList = await Product.find().populate({path: 'size', populate:'category'}).select('-__v');

        if(!productList) {
            res.status(500).json({success: false})
        }
        res.send(productList);
    }catch(err){
        console.log(err)
        return res.status(400).json({success: false, error: err.message})
    }
})

//post a new product
router.post(`/register`, uploadOptions.array('images', 5), async(req, res) =>{
    try{
        const user = await User.findById({name: req.body.user});
        const size = await Size.findById({name: req.body.size});

        if(!user && !size)
        return res.status(400).send("The user or size doesn't exists");

        const files = req.files;
        let imagesPath = [];
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        if(files){
            files.map(file=>{
                imagesPath.push(`${basePath}${file.filename}`)
            })
        }else{
            return res.status(400).send("There are no files in the request");
        }

        //relate this to user table; check if user exists and save their details
        const Uploadproduct = new Product({
            brand: req.body.brand,
            name: req.body.name,
            size: req.body.size,
            images: `${imagesPath}`,
            price: req.body.price,
            user: req.body.user
        })

        Uploadproduct.save().then((createdProduct=> {
            res.status(201).json({createdProduct: createdProduct, success: true})
        })).catch((err)=>{
            res.status(500).json({
                error: err.message,
                success: false
            })
    })
    }catch(err){
        return res.status(500).json({error : err.message})
    }
})

//get products that haven't been sold
router.get(`/`, async(req, res)=>{
    try{
        const freshProduct = await Product.find({hasBeenSold: false}).populate({path: 'size', populate:'category'});

        if(!freshProduct) {
            res.status(500).json({success: false})
        }
        res.send(freshProduct);
    }catch(err){
        res.status(500).json({err : err.message})
    }
})

//delete product
router.delete(`/delete/:id`, (req, res)=>{
    try{
        Product.findByIdAndRemove(req.params.id).then(product=>{
            if(product){
                return res.status(200).json({success: true, message: "The product has been deleted"});
            }else{
                return res.status(404).json({success: false, message: "The product has not been deleted"})
            }
        }).catch(err=>{
            return res.status(400).json({success: false, error: err})
        })
    }catch(err){
        return res.status(500).json({error : err.message})
    }
})

//get a product with the following id
router.get(`/:id`, async(req, res)=>{
    try{
        const product = await Product.findById(req.params.id).populate({path: 'size', populate:'category'})

        if(!product){
            return res.status(500).json({message: "The product with the given ID does not exist"})
        }
        res.status(200).send(product);
    }catch(err){
        console.log(err)
        return res.status(400).json({success: false, error: err.message})
    }
})


//update product
router.put(`/:id`, async(req, res)=>{
    try{
        const updateProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                brand: req.body.brand,
                name: req.body.name,
                size: req.body.size,
                images: req.body.images,
                price: req.body.price
            },{
                new: true,
            }
        )
        if(!updateProduct)
        return res.status(400).send("The product cannot be created!")
    
        res.status(200).send(updateProduct);
    }
    catch(err){
        console.log(err)
        return res.status(400).json({success: false, error: err.message})
    }
})

//filter products by size
router.get(`/filterbysize/:id`, async(req, res)=>{
    try{
        const sizeFilteredProducts = await Product.find({size: req.params.id}).populate({path: 'size', populate:'category'});

        if(!sizeFilteredProducts){
            return res.status(500).json({success: false})
        }

        return res.status(200).send(sizeFilteredProducts);
    }catch(err){
        return res.status(500).json({success: false})
    }
})

//filter products by users who posted them
router.get(`/filterbyuser/:id`, async(req, res)=>{
    try{
        const userFilteredProducts = await Product.find({user: req.params.id})
        .populate({path: 'name', populate:'category'});
    
        if(!userFilteredProducts){
            return res.status(500).json({success: false})
        }
    
        return res.status(200).send(userFilteredProducts);
    }
    catch(err){
        return res.status(500).json({success: false})
    }
})

//count
router.get(`/count`,async(req, res)=>{
    try{
        const userCount = await Product.countDocuments();

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