const express = require('express');
const app = express();
const mongoose = require('mongoose');
const env = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser')
const ejs = require('ejs');
const multer= require('multer');
const nocache = require("nocache");
const flash = require('connect-flash');
var session = require('express-session');
const mongoDbsession = require('connect-mongodb-session')(session)






const indexRouter = require('./Router/index');
const categoryRouter = require('./Router/category');
const brandRouter = require('./Router/brand');
const unitRouter = require('./Router/unit');
const supplierRouter = require('./Router/supplier');
const productRouter = require('./Router/product');
const couponRouter = require('./Router/coupon');
const coustomerRouter = require('./Router/Coustomer');
const accountRouter = require('./Router/account');
const walletRouter = require('./Router/walletbalance');
const posRouter = require('./Router/pos');
const userRouter = require('./Router/userRole')

///***********Dotenv config */


env.config({ path: './config.env'});
const DB = 'mongodb://localhost:27017/blackpos';
const PORT= process.env.PORT || 5000 ;
////*********mongo connection */

mongoose.connect(DB,{
    useNewUrlParser: true,
    useUnifiedTopology : true
}).then(()=>{
    console.log("DB connected !!!!!!!!!!!");
}).catch((error)=>{
    console.log(error);
});

const URI = 'mongodb://localhost:27017/blackpos'
//******setup for flash message */
const store = new mongoDbsession({
    uri:URI, 
    collection: 'mySessions',
  });

app.use(session({
    secret: 'thisismysecretkey',
    resave: false,
    cookie:{maxAge: 1000 * 60 },
    saveUninitialized: true,
    store:store,
  }))


//********set dependency */
app.use(flash());
app.set('view engine', 'ejs');
app.set(path.join(__dirname, 'uploads'));
app.set(path.join(__dirname, 'public'))
app.use(nocache());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());


  




///******set router *******/

app.use('/', indexRouter);
app.use('/category', categoryRouter);
app.use('/brand', brandRouter);
app.use('/unit', unitRouter);
app.use('/supplier', supplierRouter);
app.use('/product', productRouter);
app.use('/coupon', couponRouter);
app.use('/coustomer', coustomerRouter);
app.use('/account', accountRouter);
app.use('/wallet', walletRouter);
app.use('/user', posRouter);
app.use('/userrole', userRouter)




///**********Port config */

app.listen(PORT, ()=>{
    console.log(`server running on port http://localhost:${PORT}`);
})