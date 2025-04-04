const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {isAuth,isAdmin, upload, uploadcsv} = require('../Router/Auth');
const {User, Category, Brand, Unit, Supplier, Product, Account, UserRole} = require('../model/Schema');

// add user and user List
router.get('/list', isAuth, async (req, res)=>{
    try {

        const userdata = await User.findOne({ _id: req.user.id });
        if(!userdata){
            res.redirect('/')
        }
        const findrole = userdata.role;
        const userrole = await UserRole.find({ titel: findrole });
        console.log(userrole);
    
        if(userrole[0].setting.includes("views")) {

            const userdata = await User.findOne({_id:req.user.id});
            const users = await User.find({});
            const role = await UserRole.find({});
            res.render('register',{
                success : req.flash('success'),
                errors: req.flash('errors'),
                userdata:userdata,
                data: users,
                role:role
              })

        } else {
          req.flash("errors", "You do not have permission to view setings.");
          return res.redirect("back");
        } 



    } catch (error) {
        console.log(error);
    }
});

// user role
router.get('/userRoles', isAuth, async (req, res)=>{
    try {
        const userdata = await User.findOne({ _id: req.user.id });
        const findrole = userdata.role;
        const userrole = await UserRole.find({ titel: findrole });
        console.log(userrole);
    
        if(userrole[0].setting.includes("views")) {

            const userdata = await User.findOne({_id:req.user.id});
            const data = await UserRole.find({});
            
            res.render('userRoles',{
                success : req.flash('success'),
                errors: req.flash('errors'),
                userdata:userdata,
                data:data 
            })

        } else {
          req.flash("errors", "You do not have permission to view setings.");
          return res.redirect("back");
        } 
    } catch (error) {
        console.log(error);
    }
});

//add role Post Router
router.post('/addRole', async(req, res) =>{
    try {
       

   
       var { titel, category, brand, product, limit_product_list, coupon, account, income, expense, coustomer, supplier, setting} = req.body;
      
       typeof category == "string" ? category = [category] : '';
       typeof brand == "string" ? brand = [brand] : '';
       typeof product == "string" ? product = [product]: '';
     
       typeof limit_product_list == "string" ? limit_product_list = [limit_product_list] : '';
       typeof coupon == "string" ? coupon = [coupon] : '';
       typeof account == "string" ? account = [account] : '';
       typeof income == "string" ? income = [income] : '';
       typeof expense == "string" ? expense = [expense] : '';
       typeof coustomer == "string" ? coustomer = [coustomer] : '';
       typeof supplier == "string" ? supplier = [supplier] : ''; 
       typeof setting == "string" ? setting = [setting] : '';
        
       const data = new UserRole({titel, category, brand, product, limit_product_list, coupon, account, income, expense, coustomer, supplier, setting})
       await data.save();

       res.redirect('/userrole/userRoles');
    } catch (error) {
        console.log(error);
    }
});


//update coustomer
router.get('/update/:id', isAuth, async (req, res)=>{
    try {
        const userdata = await User.findOne({_id:req.user.id});
        const users = await User.findById(req.params.id);
        const role = await UserRole.find({});

        res.render('updateUser',{
            success : req.flash('success'),
            errors: req.flash('errors'),
            userdata:userdata,
            data: users,
            role:role 
           
        })
        
    } catch (error) {
        console.log(error);
    }
})
router.get('/deletlist/:id', isAuth, async (req, res)=>{
    try {

        const users = await User.findByIdAndDelete(req.params.id);
        req.flash("success", `${users.username} delet success fully`);
      res.redirect('back')
    } catch (error) {
        console.log(error);
    }
})
// update user
router.post('/userupdate', upload.single('img'),async (req, res)=>{
    try {
        const {firstName,lastName,email,mobile,addres,username,userid,userdata,role} = req.body
         const filemane = req.file.filename
        const roles = await UserRole.find({});
        const users = await User.find({});
        const userData = await User.findOne({ _id:userdata });
         console.log(req.body,req.file);
      
        const data = await User.findByIdAndUpdate(userid,{
        ...req.body,
        img:filemane
        } )
        req.flash("success", `${data.username} update success fully`);
        
        return res.render("register", {
            errors: '',
            success: req.flash(`${req.body.username}'s Data is sucessfully updated`),
            userdata: userData,
            role: roles,
            data: users,
          });
    } catch (error) {
        console.log(error);
    }
})

// update user role get router 
router.get('/roleupdate/:id', isAuth, async (req, res)=>{
    try {

        const userdata = await User.findOne({_id:req.user.id});
        const role = await UserRole.findById(req.params.id);
    

        res.render('updateRole',{ 
            success : req.flash('success'),
            errors: req.flash('errors'),
            userdata:userdata,
            role:role
           
        })
        
    } catch (error) {
        console.log(error);
    }
});

// update user role post router
router.post('/updaterole/:id', async (req, res)=>{
    try {
        


        const data = await UserRole.findByIdAndUpdate(req.params.id, req.body);

        res.redirect('/userrole/userRoles')
    } catch (error) {
        console.log(error);
    }
})

//remove user role 
router.get('/delet/:id', isAuth, async (req, res)=>{
    try {

        

        
        const data = await UserRole.findByIdAndDelete(req.params.id);
        
        res.redirect('/userrole/userRoles')
    } catch (error) {
        console.log(error);
    }
})

module.exports = router