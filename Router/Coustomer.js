const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const {isAuth,isAdmin, upload} = require('../Router/Auth');
const {User, Category, Coustomer, UserRole,Account, Order} = require('../model/Schema');

// add coustomer get router
router.get('/add', isAuth , async (req, res)=>{
    try {
        const userdata = await User.findOne({_id:req.user.id})
        res.render('addCoustomer',{
            success : req.flash('success'),
            errors: req.flash('errors'),
            userdata:userdata
        })
    } catch (error) {
        console.log(error);
    }
});

// add coustomer post router
router.post('/coustomer-add', upload.single("couImg"), async (req, res)=>{
    try {
        

            const {cousName, cousMobile, cousEmail, cousAddres, cousState, cousPINcode} = req.body;
            const cousImage = req.file.filename;

                    const mobile = await Coustomer.findOne({cousMobile:cousMobile});
                
                            if(mobile){
                                fs.unlinkSync(req.file.path)
                                req.flash('errors', `${mobile} alredy added please choose onother`)
                            return res.redirect('back') 
                            }

            //*****resized image */
            const { filename: image } = req.file;
            await sharp(req.file.path)
            .resize(200, 200)
            .jpeg({ quality: 90 })
            .toFile(
                path.resolve(req.file.destination,'resized',image)
            )

            fs.unlinkSync(req.file.path)


            const newCat = await Coustomer.create({cousName, cousMobile, cousEmail, cousAddres, cousState, cousPINcode, cousImage});

            req.flash('success', `${cousName} Add success fuly`)
            res.redirect('/coustomer/list')
        
    } catch (error) {
        console.log(error);
    }
})

// update coustomer get router
router.get('/update/:id', isAuth , async (req, res)=>{
    try {
             const userdata = await User.findOne({ _id: req.user.id });
             const findrole = userdata.role;
             const userrole = await UserRole.find({ titel: findrole });
             console.log(userrole);
         
             if(userrole[0].coustomer.includes("update")) {
                const userdata = await User.findOne({_id:req.user.id})
                const cost = await Coustomer.findById(req.params.id)
                res.render('updateCoustomer',{
                    success : req.flash('success'),
                    errors: req.flash('errors'),
                    userdata:userdata,
                    data: cost
                })
               return res.redirect("back");
     
             } else {
               req.flash("errors", "You do not have permission to update customer Account.");
               return res.redirect("back");
             } 
    } catch (error) {
        console.log(error);
    }
});

//update coustomer post router
router.post('/coustomer-update/:id', isAuth, upload.single("couImg"), async (req, res)=>{
    try {

        

        const coustom = await Coustomer.findById({_id:req.params.id})


        const cousName = req.body.cousName
        const cousMobile = req.body.cousMobile
        const cousEmail = req.body.cousEmail
        const cousAddres = req.body.cousAddres
        const cousState = req.body.cousState
        const cousPINcode = req.body.cousPINcode

      
       const cosmob = await Coustomer.findOne({cousMobile:cousMobile, _id: {$ne : req.params.id}});
    
       if(cosmob){
            if(req.file){
                fs.unlinkSync(req.file.path)
            }
           
           req.flash('errors', `${cousMobile} alredy added please choose onother`)
           return res.redirect('back') 
       }


        coustom.cousName=cousName
        coustom.cousMobile=cousMobile
        coustom.cousEmail=cousEmail
        coustom.cousAddres=cousAddres
        coustom.cousState=cousState
        coustom.cousPINcode=cousPINcode

       if(req.file){

             //*****resized image */
             const { filename: image } = req.file;
             await sharp(req.file.path)
             .resize(200, 200)
             .jpeg({ quality: 90 })
             .toFile(
                 path.resolve(req.file.destination,'resized',image)
             )
 
             fs.unlinkSync(req.file.path)

            coustom.cousImage = req.file.filename
        }
     
        await coustom.save();
        req.flash('success', `${cousName} update success fuly`)
        res.redirect('/coustomer/list')
        
        
    } catch (error) {
        console.log(error);
    }
    
})


// coustomer list get router
router.get('/list', isAuth , async (req, res)=>{
    try {
        const userdata = await User.findOne({_id:req.user.id})
        const costList = await Coustomer.find({});
        res.render('coustomer',{
            success : req.flash('success'),
            errors: req.flash('errors'),
            userdata:userdata,
            data:costList
        })
    } catch (error) {
        console.log(error);
    }
});

// update coustomer balance
router.post('/balance', async (req, res)=>{
    var balance = req.body.balance
    const data = await Coustomer.findById(req.body.addbal);
    data.Balance = parseInt(data.Balance) + parseInt(balance);
    await data.save();

    res.redirect('back')
    
});

//delet coustomer
router.get('/delet/:id', isAuth, async (req,res)=>{
    try {
        
       
        const userdata = await User.findOne({ _id: req.user.id });
        const findrole = userdata.role;
        const userrole = await UserRole.find({ titel: findrole });
        console.log(userrole);
    
        if(userrole[0].coustomer.includes("delet")) {
          
        const del = await Coustomer.findByIdAndDelete(req.params.id)
        req.flash('success', `${del.cousName} Delet success fuly`)
        res.redirect('/coustomer/list')
      
        } else {
          req.flash("errors", "You do not have permission to delet customaer.");
          return res.redirect("/coustomer/list");
        } 

    } catch (error) {
        console.log(error);
    }
})


// coustomer views Order List page
router.get('/views/:id', isAuth , async (req, res)=>{
    try {
        const userdata = await User.findOne({_id:req.user.id})
        const cost = await Coustomer.findById({_id:req.params.id});
        const order = await Order.find({coustomerId:req.params.id})
      
        res.render('costomerListView',{
            success : req.flash('success'),
            errors: req.flash('errors'),
            userdata:userdata,
            data:cost,
            order:order
        })


        
    } catch (error) {
        console.log(error);
    }
});

// coustomer views Transection List page
router.get('/viewtransection/:id', isAuth , async (req, res)=>{
    try {
        var id=req.params.id
        const userdata = await User.findOne({_id:req.user.id})
        const cost = await Coustomer.findById({_id:req.params.id});
        const transList =  await Account.aggregate([
            {$unwind: "$transaction"},
            {$match : {"transaction.walletName": {$eq:id} }},
            {$project: {
                        _id:0,
                        accDesscri: 0 ,
                        accNumber: 0 ,
                        createdAt: 0 ,
                        updatedAt: 0 
                        }
            }
        ]);

   

    

        res.render('coustomerListTransection',{
            success : req.flash('success'),
            errors: req.flash('errors'),
            userdata:userdata,
            data:cost,
            list: transList
        })


        
    } catch (error) {
        console.log(error);
    }
});


//order invoice download get router
router.get('/invoice/:id', async (req, res)=>{
    const order = await Order.findById(req.params.id)
    
    res.status(200).json({
        status:'success',
        data:order
    })

})
module.exports = router