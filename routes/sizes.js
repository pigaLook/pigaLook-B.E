const {Size} = require('../models/size');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();

router.get(`/`, async (req, res) =>{
    const sizeList = await Size.find();

    if(!sizeList) {
        res.status(500).json({success: false})
    }
    res.send(sizeList);
})

router.post(`/register`, async (req, res)=>{
    try{
        const category = await Category.find({name: req.body.category});

        if(!category)
        return res.status(400).send("Invalid Category");

        const existingUser = await Size.find({name: req.body.name});
        if (existingUser) {
        return res.status(200).json({ success: false, message: 'A size like this exists' });
        }

        let size = new Size({
            name: req.body.name,
            category: req.body.category
        })

        const savedSize = await size.save()
        
        if(!savedSize)
        return res.status(400).send("Failed to save the category").json({success: false})

        return res.status(201).json({size: size, success: true});
    }catch(err){
        return res.status(500).json({error : err})
    }
})

router.delete(`/:id`, (req, res)=>{
    Size.findByIdAndRemove(req.params.id).then(size=>{
        if(size){
            return res.status(200).json({success: true, message: "The size has been deleted"});
        }else{
            return res.status(404).json({success: false, message: "The size has not been deleted"})
        }
    }).catch(err=>{
        return res.status(400).json({success: false, error: err})
    })
})

router.get(`/:id`, async(req, res)=>{
    const size = await Size.findById(req.params.id);

    if(!size){
        res.status(500).json({message: "category with the given ID does not exist"})
    }
    res.status(200).send(size);
})

router.put(`/:id`, async(req, res)=>{
    const sizeById = await Size.findById(req.body.size);
    if(!sizeById) return res.status(400).send("Invalid size");

    const size = await Size.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
        },{
            new: true,
        }
    )
    if(!size)
    return res.status(400).send("The category cannot be created!")

    res.status(200).send(size);
})

module.exports =router;