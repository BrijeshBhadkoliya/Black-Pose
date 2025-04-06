const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');




const isAuth = (req,res,next)=>{
    const token = req.cookies.jwt;
  
    if(!token){
       return res.redirect('/login');
    }
   
    var user = jwt.verify(token ,"brijesh");
   
    if(!user){
       return res.redirect('/login');
    }
   
    req.user = user
    next();
};

const isAdmin = (req, res, next)=>{
    isAuth(req, res,async function(user){
       
      
        if(req.user.role == "admin"){
            next()
        }else{
            req.flash('errors', `!!! ONLY ADMIN CAN DO THIS!!!!!!`),
            res.redirect('back')
           
    }
    }
)}





const upload = multer({storage:
    multer.diskStorage({
        filename: function(req, file, CB){
            CB(null, Date.now() + file.originalname)
        },
        destination: function(req, file, CB){
            CB(null, './public/uploads')
        }
    })

})
//./public/uploads
const uploadcsv = multer({ storage: 
    multer.diskStorage({
    destination:function(req, file, cb){
        cb(null, './public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, 'product.csv')
      }
    })
 })
//./public/uploads
//product.csv


module.exports = { isAuth, isAdmin, upload, uploadcsv}