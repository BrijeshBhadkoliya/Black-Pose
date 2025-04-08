const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {isAuth,isAdmin, upload, uploadcsv} = require('../Router/Auth');
const {Coupon, User,UserRole,Shop} = require('../model/Schema');



// add Couponget router
router.get('/list', isAuth , async (req, res)=>{
    try {
        const userdata = await User.findOne({_id:req.user.id})
       var couponList = await Coupon.find({})
       const footer = await Shop.findOne()

        res.render('coupon',{
            success : req.flash('success'),
            errors: req.flash('errors'),
            userdata:userdata,
            data:couponList,
            footer
        })
    } catch (error) {
        console.log(error);
    }
});

// add coupon post router
router.post('/add', isAuth, async (req, res)=>{
    try {

       
        const userdata = await User.findOne({ _id: req.body.userid });
        const findrole = userdata.role;
        const userrole = await UserRole.find({ titel: findrole });
        
    
        if(userrole[0].coupon.includes("add")) {
            const coup = await Coupon.create(req.body)

            req.flash('success', `${coup.Titel} Add success fuly`)
            res.redirect('/coupon/list')
            
        } else {
          req.flash("errors", "You do not have permission to add cupon.");
          return res.redirect("/coupon/list");
        } 

        

        
    } catch (error) {
        console.log(error);
    }
});

// update coupon get router
router.get('/updatecoupon/:id', isAuth, async (req, res)=>{
    try {




        
        const userdata = await User.findOne({ _id: req.user.id });
        const findrole = userdata.role;
        const userrole = await UserRole.find({ titel: findrole });
        const footer = await Shop.findOne()
        
    
        if(userrole[0].coupon.includes("update")) {

            const userdata = await User.findOne({_id:req.user.id})
            const coup = await Coupon.findOne({_id:req.params.id})
            res.render('updateCoupon',{
                success : req.flash('success'),
                errors: req.flash('errors'),
                userdata:userdata,
                data:coup,
                footer
            })
        } else {
          req.flash("errors", "You do not have permission to update cupon.");
          return res.redirect("back");
        } 
    } catch (error) {
        console.log(error);
    }

})

//update coupon post router
router.post('/update/:id', isAuth,  async (req, res)=>{
    try {
    

       const data = await Coupon.findByIdAndUpdate(req.params.id, {
        $set: req.body
       },
       {
        new: true
       })
        
        req.flash('success', `${data.Titel} update success fuly`)
        res.redirect("/coupon/list")
        
        
    } catch (error) {
        console.log(error);
    }
    
    })

//delet Coupon
router.get('/delet/:id', isAuth, async (req,res)=>{
    try {
      

         const userdata = await User.findOne({ _id: req.user.id });
        const findrole = userdata.role;
        const userrole = await UserRole.find({ titel: findrole });
        
    
        if(userrole[0].coupon.includes("delet")) {

            const cop = await Coupon.findByIdAndDelete(req.params.id)
            req.flash('success', `${cop.Titel} Delet success fuly`)
            res.redirect('back')
        } else {
          req.flash("errors", "You do not have permission to delet cupon.");
          return res.redirect("back");
        } 
  



    } catch (error) {
        console.log(error);
    }
})

// coupon status switchry
router.get('/updatestatus/:id', isAuth, async (req, res)=>{
    try {
       
        
        const cou = await Coupon.findOne({_id:req.params.id})
        cou.status == "active" ? cou.status = "deactive" : cou.status = "active";

        await cou.save();
        res.status(200).json({
            success:"coupon status update !!!!!"
        })
       
    } catch (error) {
        console.log(error);
    }

})




module.exports = router