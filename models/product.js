const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    brand: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    images:[{
        type: String,
        required: true
    }],
    size:{
        type: String,
        required: true
    },
    price:{
        type: String,
        required: true
    },
    hasBeenSold:{
        type: Boolean,
        default: false,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
})

productSchema.virtual('id').get(function(){
    return this._id.toHexString();
})

productSchema.set("toJSON", {
    virtuals: true
})

exports.Product = mongoose.model('Product', productSchema);
