function errorHandler(err, req, res, next){
    if(err.name === "Unauthorizederror"){
        return res.status(401).json({message: err})
    }
    if(err.name === "Validationerror"){
        return res.status(401).json({message: err})
    }

    return res.status(500).json(err)
}

module.exports = errorHandler;