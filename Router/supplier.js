const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const {isAuth,isAdmin, upload} = require('../Router/Auth');
const {User,UserRole ,Category, Supplier, Product, Account, Shop} = require('../model/Schema')
const access = require('../Router/symbol');



// add supplier get router
router.get('/add', isAuth ,   async (req, res)=>{
    try {


        const userdata = await User.findOne({ _id: req.user.id });
        const footer = await Shop.findOne({});
     

        const findrole = userdata.role;
        const userrole = await UserRole.find({ titel: findrole });
        
    
        if(userrole[0].supplier.includes("add")) {
            const userdata = await User.findOne({_id:req.user.id})
            const catList = await Category.find({});
            res.render('addSupplier',{
                success : req.flash('success'),
                errors: req.flash('errors'),
                userdata:userdata,
                data:'',
                footer
            })
        } else {
          req.flash("errors", "You do not have permission to add supliar Account.");
          return res.redirect("/supplier/list");
        } 





     
    } catch (error) {
        console.log(error);
    }
});
// add supplier post router
router.post('/addsupplier', upload.single("supImg"), async (req, res)=>{
    try {
       const suppName = req.body.supName;
       const suppMobile = req.body.supMob;
       const suppEmail = req.body.supEmail;
       const suppAddres = req.body.supadrs;
       const suppImage = req.file.filename;
       const suppState = req.body.supstat;
       const suppPINcode = req.body.suppico;
       
        const supList = await Supplier.findOne({suppName:suppName});
            if(supList){
                fs.unlinkSync(req.file.path)
                req.flash('errors', `${suppName} alredy added please choose onother`)
                return res.redirect('/supplier/add') 
            }

        const supe = await Supplier.findOne({suppEmail:suppEmail});
            if(supe){
                fs.unlinkSync(req.file.path)
                req.flash('errors', `${supe} alredy added please choose onother`)
                return res.redirect('/supplier/add') 
            }

        const supm = await Supplier.findOne({suppMobile:suppMobile});
            if(supm){
                fs.unlinkSync(req.file.path)
                req.flash('errors', `${supm} alredy added please choose onother`)
                return res.redirect('/supplier/add') 
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

        const newsupp = await Supplier.create({suppName, suppMobile, suppEmail, suppAddres, suppImage, suppState, suppPINcode});

        req.flash('success', `${suppName} Add success fuly`)
        res.redirect('/supplier/list')
        
    } catch (error) {
        console.log(error);
    }
})
// supplier List
router.get('/list', isAuth , async (req, res)=>{
    try {
        const userdata = await User.findOne({_id:req.user.id})
        const footer = await Shop.findOne({});

        const suppList = await Supplier.find({});

        res.render('supplierList',{
            success : req.flash('success'),
            errors: req.flash('errors'),
            userdata:userdata,
            data:suppList,
            footer
        })
    } catch (error) {
        console.log(error);
    }
});
// suplier views page
router.get('/views/:id', isAuth , async (req, res)=>{
    try {
        const userdata = await User.findOne({_id:req.user.id})
        const footer = await Shop.findOne({});

        const suppList = await Supplier.findById({_id:req.params.id});

        res.render('supplierView',{
            success : req.flash('success'),
            errors: req.flash('errors'),
            userdata:userdata,
            data:suppList,
            footer
        })
    } catch (error) {
        console.log(error);
    }
});
// update Supplier get router
router.get('/updateSupli/:id', isAuth, async (req, res)=>{
    try {
        

        const userdata = await User.findOne({ _id: req.user.id });
        const footer = await Shop.findOne({});

        const findrole = userdata.role;
        const userrole = await UserRole.find({ titel: findrole });
        
    
        if(userrole[0].supplier.includes("update")) {
            const userdata = await User.findOne({_id:req.user.id})
            const sup = await Supplier.findOne({_id:req.params.id})
            res.render('updateSupplier',{
                success : req.flash('success'),
                errors: req.flash('errors'),
                userdata:userdata,
                data:sup,
                footer
            })

        } else {
          req.flash("errors", "You do not have permission to update supliar Account.");
          return res.redirect("back");
        } 



      
    } catch (error) {
        console.log(error);
    }

})
//update Supplier post router
router.post('/updatesupplier/:id', isAuth, upload.single("supImg"), async (req, res)=>{
    try {
       
     


       const suppl = await Supplier.findById({_id:req.params.id})
       const suppName = req.body.supName;
       const suppMobile = req.body.supMob;
       const suppEmail = req.body.supEmail;
       const suppAddres = req.body.supadrs;
      
       const suppState = req.body.supstat;
       const suppPINcode = req.body.suppico;

      
       const supList = await Supplier.findOne({suppName:suppName, _id: {$ne : req.params.id}});
    
       if(supList){
           req.flash('errors', `${suppName} alredy added please choose onother`)
           return res.redirect('/supplier/list') 
       }

        const supe = await Supplier.findOne({suppEmail:suppEmail, _id: {$ne : req.params.id}});
       if(supe){
           req.flash('errors', `${supe} alredy added please choose onother`)
           return res.redirect('/supplier/list') 
       }

        const supm = await Supplier.findOne({suppMobile:suppMobile, _id: {$ne : req.params.id}});
       if(supm){
           req.flash('errors', `${supm} alredy added please choose onother`)
           return res.redirect('/supplier/list') 
       }


       suppl.suppName = suppName;
       suppl.suppMobile = suppMobile
       suppl.suppEmail =suppEmail
       suppl.suppAddres =suppAddres
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

            suppl.suppImage = req.file.filename
        }
       suppl.suppState =suppState
       suppl.suppPINcode =suppPINcode
     
        await suppl.save();
        req.flash('success', `${suppName} update success fuly`)
        res.redirect('/supplier/list')
        
        
    } catch (error) {
        console.log(error);
    }
    
    })
//delet Supplier
router.get('/delsupp/:id', isAuth, async (req,res)=>{
    try {
      
        

        const userdata = await User.findOne({ _id: req.user.id });
        const findrole = userdata.role;
        const userrole = await UserRole.find({ titel: findrole });
        
        
    
        if(userrole[0].supplier.includes("delet")) {
            const del = await Supplier.findByIdAndDelete(req.params.id)
            req.flash('success', `${del.suppName} Delet success fuly`)
            res.redirect('/supplier/list')
        } else {
          req.flash("errors", "You do not have permission to delet supliar Account.");
          return res.redirect("back");
        } 

        
      

    } catch (error) {
        console.log(error);
    }
})

// supplier list router
router.get('/supllist',async (req,res)=>{
    const data = await Supplier.find({});
    res.status(201).json(data);
})

// supllier product router
router.get('/product/:id', isAuth, async (req,res)=>{
    try {
        const accessdata = await access (req.user)
        const productSpliyer = await Product.aggregate([
            {
              '$lookup': {
                'from': 'orders',
                'let': {
                  'serch': '$Name'
                },
                'pipeline': [
                  {
                    '$match': {
                      '$expr': {
                        '$in': [
                          '$$serch', '$item.productName'
                        ]
                      }
                    }
                  }, {
                    '$project': {
                      'item': 1
                    }
                  }
                ],
                'as': 'order'
              }
            }, {
              '$unwind': {
                'path': '$order'
              }
            }, {
              '$unwind': {
                'path': '$order.item'
              }
            }, {
              '$match': {
                '$expr': {
                  '$eq': [
                    '$order.item.productName', '$Name'
                  ]
                }
              }
            }, {
              '$group': {
                '_id': '$_id',
                'order': {
                  '$sum': '$order.item.productCount'
                }
              }
            }
          ])
        //   console.log(productSpliyer);

          
        const userdata = await User.findOne({_id:req.user.id})
        const footer = await Shop.findOne({});

        const sup = await Supplier.findById(req.params.id);
        const prod = await Product.find({supplier:sup.suppName})
console.log(prod);

const productsWithOrders = await Product.aggregate([
    {
      $match: { supplier: sup.suppName } // Filter by supplier
    },
    {
      $lookup: {
        from: 'orders',
        let: { productName: '$Name' },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ['$$productName', '$item.productName']
              }
            }
          },
          { $unwind: '$item' },
          {
            $match: {
              $expr: {
                $eq: ['$$productName', '$item.productName']
              }
            }
          },
          {
            $group: {
              _id: '$item.productName',
              orderCount: { $sum: '$item.productCount' }
            }
          }
        ],
        as: 'orderDetails'
      }
    },
    {
      $addFields: {
        order: {
          $ifNull: [{ $arrayElemAt: ['$orderDetails.orderCount', 0] }, 0]
        }
      }
    },
    {
      $project: {
        orderDetails: 0 // optional: remove raw lookup result
      }
    }
  ]);
       

  console.log(productsWithOrders);
  
      
       
       
         

        res.render('supplierProduct',{
            success : req.flash('success'),
            errors: req.flash('errors'),
            userdata:userdata,
            data:sup,
            product: productsWithOrders,
            accessdata:accessdata,
            footer,
        })
    } catch (error) {
        console.log(error);
    }
})

// suplier transction page
router.get('/transection/:id', isAuth , async (req, res)=>{
    try {
        const accessdata = await access (req.user)

        var id=req.params.id
        const suppList = await Supplier.findById({_id:req.params.id});
        const transList =  await Account.aggregate([
            {$unwind: "$transaction"},
            {$match : {"transaction.walletName": {$eq:id} }},
            {$project: {
                        _id:0,
                        accDesscri: 0 ,
                        accNumber: 0 ,
                        createdAt: 0 ,
                        updatedAt: 0 ,
                        }
            }
        ]);
        
        const Orderamount = await Account.aggregate([
            {
                $unwind: "$transaction"
            },
            {$match : {$and : [{"transaction.walletName": {$eq:id}} ,{ accTitel: {$eq:"Payable"}  }]}},
            {$project: {
                _id:"$accTitel",
                debet:  "$transaction.debit",
                credit:   "$transaction.credit"
                        }
            },
            {$group: {
                _id: "$_id",
                debet: {$sum:"$debet"},
                credit: {$sum: "$credit"}
               
            }},
            
        ]);

    
        var Orderamu = 0;
        var paymony = 0;
        if(Orderamount.length > 0 ){
            Orderamu = Orderamount[0].credit
            paymony = Orderamount[0].debet
        }

        
        const userdata = await User.findOne({_id:req.user.id})
        const footer = await Shop.findOne({});

        res.render('supplierTransection',{
            success : req.flash('success'),
            errors: req.flash('errors'),
            userdata:userdata,
            data:suppList,
            list:transList,
            Orderamount:Orderamu,
            payAmount:paymony,
            accessdata:accessdata,
            footer
        })
    } catch (error) {
        console.log(error);
    }
});

// suplier Order page
router.get('/OrderList/:id', isAuth , async (req, res)=>{
    try {
        const accessdata = await access (req.user)
        const footer = await Shop.findOne({});

        const userdata = await User.findOne({_id:req.user.id})
        const suppList = await Supplier.findById({_id:req.params.id});
      
        res.render('supplierOrderList',{
            success : req.flash('success'),
            errors: req.flash('errors'),
            userdata:userdata,
            data:suppList,
            accessdata:accessdata,
            footer
        })
    } catch (error) {
        console.log(error);
    }
});

// suplier payment
router.post('/paysupplier/:id', isAuth , async (req, res)=>{
    try { var ObjectId = mongoose.Types.ObjectId
        var id = req.params.id;
        var date = req.body.date;
        var amount = req.body.amount;
        var accountid = req.body.Account;

        //********************* save transection on selected Account**************** */
        const accou = await Account.aggregate([
            {$match : {_id : {$eq: ObjectId(accountid) } } },
            {$project: {
                accTitel: 1,
                accDesscri:1,
                accNumber:1,
                debet: {$sum: "$transaction.debit"},
                credit: {$sum : "$transaction.credit"}
                }
            }
        ]);
        var total = parseInt(accou[0].credit) - parseInt(accou[0].debet)

            if(total < amount) {
                req.flash('errors', `you have not suficeant balance`)
                return res.redirect('back')
            }

        const data = await Account.findById(accountid);
        data.transaction = data.transaction.concat({
            walletName:id,
            type: 'Expense',
            amount: amount,
            description: 'Pay to supplier',
            debit: amount,
            credit: 0,
            balance: parseInt(total) - parseInt(amount),
            date: new Date(date)
        });
        data.save();

        ///**********************debit pay amount from Payable account*********** */
        const payableAccoountdetail = await Account.aggregate([
            {$match : {accTitel: {$eq: "Payable"} }},
            {$project: {
                debet: {$sum: "$transaction.debit"},
                credit: {$sum : "$transaction.credit"}
                }
            }
        ]);
        var payTotal = parseInt(payableAccoountdetail[0].credit) - parseInt(payableAccoountdetail[0].debet)
        var payableAccoount = await Account.findOne({accTitel:"Payable"});

        payableAccoount.transaction =   payableAccoount.transaction.concat({
            walletName:id,
            type: 'Payable',
            amount: amount,
            description: 'payment of Product Added',
            debit: amount ,
            credit: 0,
            balance: parseInt(payTotal) + parseInt(amount),
            date: Date.now()
            })
        await payableAccoount.save();


        res.redirect('back')

    } catch (error) {
        console.log(error);
    }
});

module.exports = router