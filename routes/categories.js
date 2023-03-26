const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) =>{
    try{
        const categoryList = await Category.find();

        if(!categoryList) {
            return res.status(500).json({success: false})
        }
        return res.status(200).json(categoryList);
    }catch(err){
        return res.status(500).json({error : err.message})
    }
})

router.post(`/register`, async(req, res)=>{
    try{
        let category = new Category({
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
        })
    
        const savedCategory = await category.save()
        
        if(!savedCategory)
        return res.status(400).json({success: false, message: "Resource creation is unsuccessful"})
    
        return res.status(200).json({success: true, message: `${savedCategory} has been created successfully`});
    }catch(err){
        return res.status(500).json({error : err.message})
    }
})

router.delete(`/:id`, (req, res)=>{
    Category.findByIdAndRemove(req.params.id).then(category=>{
        if(category){
            return res.status(200).json({success: true, message: "The category has been deleted"});
        }else{
            return res.status(404).json({success: false, message: "The category has not been deleted"})
        }
    }).catch(err=>{
        return res.status(400).json({success: false, error: err})
    })
})

router.get(`/:id`, async(req, res)=>{
    const category = await Category.findById(req.params.id);

    if(!category){
        return res.status(500).json({message: "category with the given ID does not exist"})
    }
    res.status(200).send(category);
})

router.put(`/:id`, async(req, res)=>{
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
        },{
            new: true,
        }
    )
    if(!category)
    return res.status(400).send("The category cannot be created!")

    res.send(category);
})

module.exports = router;