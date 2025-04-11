const express = require('express');
const mongoose = require('mongoose');



const userSchema = new mongoose.Schema({
    firstName:{type: String, require: true, trim: true,},
    lastName:{type: String, require: true, trim: true},
    username:{type: String, require: true, trim: true},
    password:{type: String, require: true},
    email:{type: String, require: true},
    mobile:{type: Number, require: true},
    addres:{type: String, require: true},
    role:{type: String,default: false},
    img:{type: String, default: false}
})

const User = mongoose.model('user', userSchema);


// Category Modal
const categorySchema = new mongoose.Schema({ 
    catName:{type: String, require: true, trim: true},
    catImg:{type: String, require: true},
    status:{type: String, default: 'active'},
    subcatNames:[
        {
            subcatname:{type: String, require: true}
        }
    ] 
})

const Category = mongoose.model('category', categorySchema);



// Brand Modal
const brandSchema = new mongoose.Schema({
    brandName:{type: String, require: true,trim: true},
    brandImg:{type: String, require: true},
    
})

const Brand = mongoose.model('brand', brandSchema);

// unit Modal
const unitSchema = new mongoose.Schema({
    unit:{type: String, require: true},
})

const Unit = mongoose.model('unit', unitSchema);


// Supplier Modal
const supplierSchema = new mongoose.Schema({
    suppName:{type: String, require: true, trim: true},
    suppMobile:{type: Number, require: true},
    suppEmail:{type: String, require: true},
    suppAddres:{type: String, require: true},
    suppState:{type: String, require: true},
    suppPINcode:{type: String, require: true},
    suppImage:{type: String, require: true},
    orderList:[
        {   productName: {type: String},
            productQuntity: {type: Number},
            productPrice: {type: Number},
            totalAmount: {type: Number},
            date: {type: Date}
        }
    ],
    productList:[{productName:{type:String}}]
    
    

});

const Supplier = mongoose.model('supplier', supplierSchema);

// Product Modal
const productSchema = new mongoose.Schema({
    Name:{type: String, require: true, trim: true},
    proCode:{type: String, require: true},
    brand:{type: String, require: true},
    quantity :{type:Number, require: true},
    unitType :{type: String, require: true},
    unitValue:{type: Number, require: true},
    category:{type: String, require: true},
    SubCategory:{type: String, require: true},
    sellingPrice:{type: Number, require: true},
    purchasePrice:{type: Number, require: true},
    discountType:{type: String, require: true},
    discount:{type: Number, require: true},
    tax:{type: Number, require: true},
    supplier:{type: String, require: true},
    productImage:{type:String}
    

}) 

const Product = mongoose.model('product', productSchema); 

 
// Coupon Modal
const couponSchema = new mongoose.Schema({
    Titel:{type: String, require: true, trim: true},
    Code:{type: String, require: true},
    limitSame:{type: Number, require: true},
    startDate:{type: Date, require: true},
    endDate:{type: Date, require: true},
    disType:{type: String, require: true},
    disAmount:{type: Number, require: true},
    minOrder:{type: Number, require: true},
    maxDiscount:{type: Number, require: true},
    couponType: {type: String, require: true},
    status:{type:String, default:"active"},
    user:{type:Array, default:[]}
    

})

const Coupon = mongoose.model('coupon', couponSchema);


// coustomer Modal
const coustomerSchema = new mongoose.Schema({
    cousName:{type: String, require: true, trim: true},
    cousMobile:{type: Number, require: true},
    cousEmail:{type: String, require: true},
    cousAddres:{type: String, require: true},
    cousState:{type: String, require: true},
    cousPINcode:{type: String, require: true},
    cousImage:{type: String, require: true},
    order:[{ orderId: {type:String}}],
    Balance:{type: Number, default: 0},
    

})

const Coustomer = mongoose.model('coustomer', coustomerSchema);

// Account Modal
const accountSchema = new mongoose.Schema({
    accTitel:{type: String, require: true, trim: true},
    accDesscri:{type: String, require: true},
    accNumber:{type: String, require: true},
    transaction:[
        {
            walletName:{type: String},
            type:{type: String},
            amount: {type: Number},
            description:{type: String},
            debit:{type: Number},
            credit:{type: Number},
            balance:{type: Number},
            date:{type: Date, default: Date.now},

        }
    ]
},{
    timestamps:true
})

const Account = mongoose.model('account', accountSchema);



// cart Modal
const cartSchema = new mongoose.Schema({
   
    item:[{
        productName:{type: String, require: true, trim: true},
        productCount:{type:Number, default: 1},
        productPrice: {type:Number},
        discount:{type:Number},
        tax:{type:Number},
        total: {type:Number},
    }],
    SubTotal:{type: Number, require: true},
    Productdiscount:{type: Number, require: true},
    Coupondiscount:{type: Number, require: true},
    couponCode:{type: String},
    Tax :{type: Number, require: true},
    Amount: {type: Number, require: true},
    coustomerId: {type:String,},
    cartNote:{type:String, trim: true},
},{
    timestamps:true
});



const Cart = mongoose.model('cart', cartSchema);



// Order Modal
const orderSchema = new mongoose.Schema({
    orderId:{type:Number, default:1000},
    item:[{
        productName:{type: String, require: true, trim: true},
        productCount:{type:Number, default: 1},
        productPrice: {type:Number},
        discount:{type:Number},
        tax:{type:Number},
        total: {type:Number},
    }],
    SubTotal:{type: Number, require: true},
    Productdiscount:{type: Number, require: true},
    Coupondiscount:{type: Number, require: true},
    Tax :{type: Number, require: true},
    Amount: {type: Number, require: true},
    coustomerId: {type:String,},
    cartNote:{type:String, trim: true},
    paymentMethod:{
        type:{type:String},
        tranRef:{type:String, trim:true},
        amount:{type: Number},
        change:{type: Number}
    },
    

   
},{
    timestamps:true
})

orderSchema.pre('save', function (next) {
   
    // Only increment when the document is new
    if (this.isNew) {
       
        Order.count().then(res => {
            this.orderId = this.orderId + res // Increment count
            next();
        });
    } else {
        next();
    }
});

const Order = mongoose.model('order', orderSchema);


// shop setting Modal
const shopSchema = new mongoose.Schema({
    ShopName:{type: String, require: true, trim: true},
    Shopphone:{type: Number, require: true},
    VAT:{type: String, require: true, trim: true},
    Country:{type: String, require: true, trim: true},
    Currency:{type: String, require: true, trim: true},
    Timezone:{type: String, require: true, trim: true},
    Reorderlevel:{type: Number, require: true},
    Shopemail:{type: String, require: true},
    Shopaddress:{type: String, require: true, trim: true},
    Footer:{type: String, trim: true},
    Logo:{type: String, require: true}
   

});

const Shop = mongoose.model('shop', shopSchema);

// user Roles setting Modal
const userRole = new mongoose.Schema({
    titel:{type:String, trim: true},
    category:{type: Array},
    brand:{type: Array},
    product:{type: Array},
    limit_product_list:{type: Array},
    coupon:{type: Array},
    account:{type: Array},
    income:{type: Array},
    expense:{type: Array},
    coustomer:{type: Array},
    supplier:{type: Array},
    setting:{type: Array}

});

const UserRole = mongoose.model('userRole', userRole);






module.exports = {User, Category, Brand, Unit, Supplier, Product, Coupon, Coustomer, Account, Cart, Order, Shop, UserRole};