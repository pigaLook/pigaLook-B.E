const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const errorHandler = require('./helpers/errorhandler');
require('dotenv').config();
const authJwt = require('./helpers/jwt');

app.use(cors());
app.options('*', cors())

//middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(authJwt())
app.use(errorHandler)

app.use('/public/uploads', express.static(__dirname + '/public/uploads'));

const api = process.env.API_URL;
const PORT = process.env.PORT || 40;

//Routes
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');
const sizesRoutes = require('./routes/sizes');


//const api = process.env.API_URL;
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/sizes`, sizesRoutes);

//Database
mongoose.connect(`${process.env.CONNECTING_STRING}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'piga-look',
    useFindAndModify: false
})
.then(()=>{
    console.log('Database Connection is ready...')
})
.catch((err)=> {
    console.log(err);
})

app.listen(PORT, ()=>{
    console.log(`You are connected to port : http://localhost:${PORT}`);
})