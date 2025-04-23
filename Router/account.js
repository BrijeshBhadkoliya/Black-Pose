const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {isAuth,isAdmin, upload, uploadcsv} = require('../Router/Auth');
const {User, Category, Brand, Unit,UserRole, Supplier, Product, Account, Order, Shop} = require('../model/Schema');
var Excel = require('exceljs');
const fs = require('fs');
const path = require('path');
var csv = require("fast-csv");
const { parse } = require("fast-csv");
// add account get router
router.get('/add', isAuth ,   async (req, res)=>{
    try {
        const footer = await Shop.findOne({})

        const userdata = await User.findOne({_id:req.user.id})
            res.render('addAccount',{
               success : req.flash('success'),
               errors: req.flash('errors'),
               userdata:userdata,
               footer
            })
    } catch (error) {
        console.log(error);
    }
});

//add account POST router
router.post('/accountadd', isAuth, async (req, res)=>{
    

    const {accTitel, accBalance, accDesscri, accNumber} = req.body;


    const accNub = await Account.findOne({accNumber:accNumber});
    if(accNub){
        req.flash('errors', `${accNumber} alredy added please choose onother`)
        return res.redirect('/account/add') 
    }
            const accdata = new Account({
                accTitel:accTitel,
                accDesscri:accDesscri,
                accNumber: accNumber,
                transaction:[
                {   walletName:'',
                    type: 'Income',
                    amount:accBalance,
                    description: "new account Opening",
                    debit: 0,
                    credit:accBalance,
                    balance:accBalance,
                }
                ]
            }); 

    await accdata.save();

    req.flash('success', `${accTitel} added success fuly`)
    return res.redirect('/account/list') 
})

//account update get router
router.get('/update/:id', isAuth, async (req, res)=>{

    const userdata = await User.findOne({_id:req.user.id})
    const data = await Account.findById(req.params.id);
        const footer = await Shop.findOne({})
    
        res.render('updateAccount',{
            success : req.flash('success'),
            errors: req.flash('errors'),
            userdata:userdata,
            data:data,
            footer
        })



  
})
router.get('/delet/:id', isAuth, async (req, res)=>{
    
          const data = await Account.findByIdAndDelete(req.params.id);   
          return res.redirect("back"); 
})
//update account POST router
router.post('/accountupdate/:id', isAuth, async (req, res)=>{
    const {accTitel, accDesscri, accNumber} = req.body;

    const missingF = Object.entries(req.body)
    .filter(([key, val]) => val.trim() === "")
    .map(([key]) => key);
  
  if (missingF.length > 0) {
    req.flash("errors", `Missing fields: ${missingF.join(", ")}`);
    return res.redirect("back");
  }

    const accNub = await Account.findOne({accNumber:accNumber, _id: {$ne: req.params.id}});
    if(accNub){
        req.flash('errors', `${accNumber} alredy added please choose onother`)
        return res.redirect('/account/list') 
    }

    const data = await Account.findByIdAndUpdate(req.params.id, {
        $set: req.body,
    },{new:true})

           

   

    req.flash('success', `${accTitel} update success fuly`)
    return res.redirect('/account/list') 
})

//account List Get router
router.get('/list', isAuth , async (req, res)=>{
    try {

        const userdata = await User.findOne({ _id: req.user.id });
            const footer = await Shop.findOne({})
        
        
        
        const data = await Account.aggregate([
        
         {$project: {
                 accTitel: 1,
                 accDesscri:1,
                 accNumber:1,
                 debet: {$floor:{$sum: "$transaction.debit"}},
                 credit: {$floor:{$sum : "$transaction.credit"}},
                 balance: {$floor:{ $sum: "$transaction.balance"},}
         }
                     
         },
         
     ])
         res.render('accountList',{
             success : req.flash('success'),
             errors: req.flash('errors'),
             userdata:userdata,
             data:data,
             footer
         })

        
    } catch (error) {
        console.log(error);
    }
});


//account transection List Get router
router.get('/transection', isAuth , async (req, res)=>{
    try {
        const userdata = await User.findOne({_id:req.user.id})
            const footer = await Shop.findOne({})
        

        const acc = await Account.find({},{accTitel:1});
        const data = await Account.aggregate([
                {$unwind: "$transaction"},
                {$project: {
                            _id:0,
                            accDesscri: 0 ,
                            accNumber: 0 ,
                            createdAt: 0 ,
                            updatedAt: 0 
                            }
                }
        ])
   
        res.render('accTran',{
            success : req.flash('success'),
            errors: req.flash('errors'),
            userdata:userdata,
            data:data,
            accunt:acc,
            serch:'',
            footer
        })


       
    } catch (error) {
        console.log(error);
    }
});

//account transection filter List Post router
router.post('/transection-filter', isAuth , async (req, res)=>{
    try {
        const userdata = await User.findOne({_id:req.user.id}) 
        const footer = await Shop.findOne({})


        const startDate = req.body.StartDate;
        const endDate = req.body.enddate;
        const acctitel = req.body.AccTitel;
        const type = req.body.Acctype;
        var match= ''
        const serc = {
            acctitel:acctitel,
            type:type,
            startDate:startDate,
            endDate:endDate
        }
       

        if(acctitel=='' && type=='' && startDate=='' && endDate=='') {
            return res.redirect('/account/transection')
           
        }
        
        if(acctitel!='' && type=='' && startDate=='' && endDate=='') {
            var match =  {accTitel: {$eq: acctitel} } 
           
        }else if(acctitel=='' && type!='' && startDate=='' && endDate==''){
            var match =  {"transaction.type": {$eq: type} } 
            
        }else if(acctitel!='' && type!='' && startDate=='' && endDate==''){
            var match = { $and: [
                                    {accTitel: {$eq: acctitel} }, 
                                    {"transaction.type": {$eq: type} } 
                                    ]
                        }
        }else if(acctitel=='' && type=='' && startDate!='' && endDate==''){
            var match =  {"transaction.date": {$gte: new Date(startDate)}}
        }else if(acctitel=='' && type=='' && startDate=='' && endDate!=''){
            var match =  {"transaction.date": {$lte: new Date(endDate)}}
        }else if(acctitel=='' && type=='' && startDate!='' && endDate!=''){
            var match = { $and: [
                                    {"transaction.date": {$gte: new Date(startDate)}}, 
                                    {"transaction.date": {$lte: new Date(endDate)}}
                                ]
                        }
        }else if(acctitel!='' && type=='' && startDate!='' && endDate!=''){
            var match = { $and: [
                                    {"transaction.date": {$gte: new Date(startDate)}}, 
                                    {"transaction.date": {$lte: new Date(endDate)}},
                                    {accTitel: {$eq: acctitel} } 
                                ]
                        }
        }else if(acctitel=='' && type!='' && startDate!='' && endDate!=''){
            var match = { $and: [
                                    {"transaction.date": {$gte: new Date(startDate)}}, 
                                    {"transaction.date": {$lte: new Date(endDate)}},
                                    {"transaction.type": {$eq: type} }
                                ]
                        }
        }else if(acctitel!='' && type!='' && startDate!='' && endDate!=''){
            var match = { $and: [
                                    {"transaction.date": {$gte: new Date(startDate)}}, 
                                    {"transaction.date": {$lte: new Date(endDate)}},
                                    {"transaction.type": {$eq: type} },
                                    {accTitel: {$eq: acctitel} } 
                                ]
                        }
        }
        
        const acc = await Account.find({},{accTitel:1});
        const data = await Account.aggregate([
                {$unwind: "$transaction"},
                {$match : match},
                {$project: {
                            _id:0,
                            accDesscri: 0 ,
                            accNumber: 0 ,
                            createdAt: 0 ,
                            updatedAt: 0 
                            }
                }
        ])
  
    res.render('accTran',{
        success : req.flash('success'),
        errors: req.flash('errors'),
        userdata:userdata,
        data:data,
        accunt:acc,
        serch:serc,
        footer
    })


  
    } catch (error) {
        console.log(error);
    }
});

//export transection exle file
router.get('/download-transection', isAuth ,async (req, res)=>{
    try {
        const data = await Account.aggregate([
            {$unwind: "$transaction"},
            
            { "$addFields": { 
                            "type": "$transaction.type" ,
                            Amount: "$transaction.amount",
                            description : "$transaction.description" ,
                            debit : "$transaction.debit" ,
                            creadit : "$transaction.credit" ,
                            balance : "$transaction.balance" ,
                            date : "$transaction.date" ,
                            } 
            },
            {$project: {
                _id:0,
                createdAt: 0 ,
                updatedAt: 0,
                accDesscri: 0,
                accNumber: 0,
                transaction:0 
                

                }
            },
            {
                $sort: {date: -1}
            }
    ])
        
        let workbook = new Excel.Workbook();
        let worksheet = workbook.addWorksheet("transec");

        worksheet.columns = [
            { header: 'account', key: 'accTitel', width: 35},
            { header: 'transection_type ', key: 'type', width: 35},
            { header: 'Amount', key: 'Amount', width: 20},
            { header: 'description', key: 'description', width: 20},
            { header: 'debit', key: 'debit', width: 20},
            { header: 'creadit', key: 'creadit', width: 20},
            { header: 'balance', key: 'balance', width: 20},
            { header: 'date', key: 'date', width: 20}

            ];

            data.forEach(function(row){ worksheet.addRow(row); })
           
         

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              );
              res.setHeader(
                "Content-Disposition",
                "attachment; filename=" + "transec.xlsx"
              );
            return workbook.xlsx.write(res).then(function () {
             res.status(200).end
            });

            
    


              

    } catch (error) {
        console.log(error);
    }
})

//Expense Get router
router.get('/expense', isAuth , async (req, res)=>{
    try {
        const userdata = await User.findOne({_id:req.user.id})
            const footer = await Shop.findOne({})
        
        const acc = await Account.aggregate([{$match : {$and: [ 
            {"accTitel": {$ne: 'Receivable'}},
            {"accTitel": {$ne: 'Payable'} }
        ] 
            }}]);
        const data = await Account.aggregate([
            {$unwind: "$transaction"},
            {$match : {"transaction.type": {$eq: "Expense"} }},
            {$project: {
                        _id:0,
                        accDesscri: 0 ,
                        accNumber: 0 ,
                        createdAt: 0 ,
                        updatedAt: 0 
                        }
            }
        ]);
        
        res.render('expense',{
            success : req.flash('success'),
            errors: req.flash('errors'),
            userdata:userdata,
            accunt:acc,
            data:data,
            serch:'',
            footer
        })


    } catch (error) {
        console.log(error);
    }
});

//Expense filter  Get router
router.post('/expensefilter', isAuth , async (req, res)=>{
    try {
        const userdata = await User.findOne({_id:req.user.id})
        const footer = await Shop.findOne({})


        const{startDate, endDate} = req.body;
        const acc = await Account.aggregate([{$match : {$and: [ 
            {"accTitel": {$ne: 'Receivable'}},
            {"accTitel": {$ne: 'Payable'} }
        ] 
        }}]);
        const data = await Account.aggregate([
            {$unwind: "$transaction"},
            {$match : { $and: [
                                {"transaction.date": {$gte: new Date(startDate)}} , 
                                {"transaction.date": {$lte: new Date(endDate+'T23:59:59.000Z')}} , 
                                {"transaction.type": {$eq: "Expense"} }
                            ]
                    } 
            },
            
            {$project: {
                        _id:0,
                        accDesscri: 0 ,
                        accNumber: 0 ,
                        createdAt: 0 ,
                        updatedAt: 0 
                        }
            }
        ]);

   
        res.render('expense',{
            success : req.flash('success'),
            errors: req.flash('errors'),
            userdata:userdata,
            accunt:acc,
            data:data,
            serch:'',
            footer
        })


    } catch (error) {
        console.log(error);
    }
});


//add Expense Post router
router.post('/addexpense', isAuth, async (req, res)=>{
    try {

        const ObjectId = mongoose.Types.ObjectId; 
        const {AccTitel, expdesc, expamount, expdate} = req.body;



        const missingF = Object.entries(req.body)
        .filter(([key, val]) => val.trim() === "")
        .map(([key]) => key);
      
      if (missingF.length > 0) {
        req.flash("errors", `Missing fields: ${missingF.join(", ")}`);
        return res.redirect("back");
      }


        const accou = await Account.aggregate([
            {$match : {_id : {$eq: ObjectId(AccTitel) } } },
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

            if(total < expamount) {
                req.flash('errors', `you have not suficeant balance`)
                return res.redirect('back')
            }
        
       
          
        const data = await Account.findById(AccTitel);
        data.transaction = data.transaction.concat({
            walletName:'',
            type: 'Expense',
            amount: expamount,
            description: expdesc,
            debit: expamount,
            credit: 0,
            balance: parseInt(total) - parseInt(expamount),
            date: new Date(expdate)
        });
        data.save();

        req.flash('success', `your expense add success fully`)
        return res.redirect('back')

    } catch (error) {
        console.log(error);
    }
})


//Income Get router
router.get('/income', isAuth , async (req, res)=>{
    try {
        const footer = await Shop.findOne({})

        
        const userdata = await User.findOne({_id:req.user.id})
        const acc = await Account.aggregate([{$match : {$and: [ 
            {"accTitel": {$ne: 'Receivable'}},
            {"accTitel": {$ne: 'Payable'} }
        ] 
}}]);
        const data = await Account.aggregate([
            {$unwind: "$transaction"},
            {$match : {"transaction.type": {$eq: "Income"} }},
            {$project: {
                        _id:0,
                        accDesscri: 0 ,
                        accNumber: 0 ,
                        createdAt: 0 ,
                        updatedAt: 0 
                        }
            }
        ]);

   
        res.render('income',{
            success : req.flash('success'),
            errors: req.flash('errors'),
            userdata:userdata,
            accunt:acc,
            data:data,
            serch:'',
            footer
        })


    } catch (error) {
        console.log(error);
    }
});

//Income filter  Get router
router.post('/incomefilter', isAuth , async (req, res)=>{
    try {
        const userdata = await User.findOne({_id:req.user.id})
        const footer = await Shop.findOne({})

     
        const{startDate, endDate} = req.body;

        const acc = await Account.aggregate([{$match : {$and: [ 
            {"accTitel": {$ne: 'Receivable'}},
            {"accTitel": {$ne: 'Payable'} }
        ] 
        }}]);
        const data = await Account.aggregate([
            {$unwind: "$transaction"},
            {$match : { $and: [
                                {"transaction.date": {$gte: new Date(startDate)}} , 
                                {"transaction.date": {$lte: new Date(endDate+'T23:59:59.000Z')}} , 
                                {"transaction.type": {$eq: "Income"} }
                            ]
                    } 
            },
            
            {$project: {
                        _id:0,
                        accDesscri: 0 ,
                        accNumber: 0 ,
                        createdAt: 0 ,
                        updatedAt: 0 
                        }
            }
        ]);

   
        res.render('income',{
            success : req.flash('success'),
            errors: req.flash('errors'),
            userdata:userdata,
            accunt:acc,
            data:data,
            serch:'',
            footer
        })


    } catch (error) {
        console.log(error);
    }
});


//add Income Post router
router.post('/addincome', isAuth, async (req, res)=>{
    try {
        



        const ObjectId = mongoose.Types.ObjectId; 
        const {AccTitel, incdesc, incamount, incdate} = req.body;

        const missingF = Object.entries(req.body)
        .filter(([key, val]) => val.trim() === "")
        .map(([key]) => key);
      
      if (missingF.length > 0) {
        req.flash("errors", `Missing fields: ${missingF.join(", ")}`);
        return res.redirect("back");
      }

        const accou = await Account.aggregate([
            {$match : {_id : {$eq: ObjectId(AccTitel) } } },
            {$project: {
                debet: {$sum: "$transaction.debit"},
                credit: {$sum : "$transaction.credit"}
                }
            }
        ]);

        var total = parseInt(accou[0].credit) - parseInt(accou[0].debet);
        const data = await Account.findById(AccTitel);
        data.transaction = data.transaction.concat({
            walletName:'',
            type: 'Income',
            amount: incamount,
            description: incdesc,
            debit: 0,
            credit: incamount,
            balance: parseInt(total) + parseInt(incamount),
            date: new Date(incdate)
        });
        data.save();

        req.flash('success', `your income add success fully`)
        return res.redirect('back')

    } catch (error) {
        console.log(error);
    }
})


// transfer Get router
router.get('/transfer', isAuth , async (req, res)=>{
    try {
        const userdata = await User.findOne({_id:req.user.id})
        const footer = await Shop.findOne({})


        const acc = await Account.aggregate([{$match : {$and: [ 
                                                                    {"accTitel": {$ne: 'Receivable'}},
                                                                    {"accTitel": {$ne: 'Payable'} }
                                                                ] 
                                                        }}]);


        const data = await Account.aggregate([
            {$unwind: "$transaction"},
            {$match : {"transaction.type": {$eq: "Transfer"} }},
            {$project: {
                        _id:0,
                        accDesscri: 0 ,
                        accNumber: 0 ,
                        createdAt: 0 ,
                        updatedAt: 0 
                        }
            }
        ]);

   
        res.render('transfer',{
            success : req.flash('success'),
            errors: req.flash('errors'),
            userdata:userdata,
            accunt:acc,
            data:data,
            serch:'',
            footer
        })


    } catch (error) {
        console.log(error);
    }
});

// transfer filter  Get router
router.post('/transferfilter', isAuth , async (req, res)=>{
    try {
        const userdata = await User.findOne({_id:req.user.id})
        const footer = await Shop.findOne({})


        const{startDate, endDate} = req.body;
        const acc = await Account.aggregate([{$match : {$and: [ 
            {"accTitel": {$ne: 'Receivable'}},
            {"accTitel": {$ne: 'Payable'} }
        ] 
            }}]);
        const data = await Account.aggregate([
            {$unwind: "$transaction"},
            {$match : { $and: [
                                {"transaction.date": {$gte: new Date(startDate)}} , 
                                {"transaction.date": {$lte: new Date(endDate+'T23:59:59.000Z')}} , 
                                {"transaction.type": {$eq: "Transfer"} }
                            ]
                    } 
            },
            
            {$project: {
                        _id:0,
                        accDesscri: 0 ,
                        accNumber: 0 ,
                        createdAt: 0 ,
                        updatedAt: 0 
                        }
            }
        ]);

   
        res.render('transfer',{
            success : req.flash('success'),
            errors: req.flash('errors'),
            userdata:userdata,
            accunt:acc,
            data:data,
            serch:'',
            footer
        })


    } catch (error) {
        console.log(error);
    }
});


//add transfer Post router
router.post('/addtransfer', isAuth, async (req, res)=>{
    try {

        

        
        const ObjectId = mongoose.Types.ObjectId; 
        const {Accfrom, AccTo, trndesc, trnamount, trandate} = req.body;



        const missingF = Object.entries(req.body)
    .filter(([key, val]) => val.trim() === "")
    .map(([key]) => key);
  
  if (missingF.length > 0) {
    req.flash("errors", `Missing fields: ${missingF.join(", ")}`);
    return res.redirect("back");
  }



        const fromacc = await Account.aggregate([
            {$match : {_id : {$eq: ObjectId(Accfrom) } } },
            {$project: {
                accTitel: 1,
                accDesscri:1,
                accNumber:1,
                debet: {$sum: "$transaction.debit"},
                credit: {$sum : "$transaction.credit"}
                }
            }
        ]);
      
        
        var fromtotal = parseInt(fromacc[0].credit) - parseInt(fromacc[0].debet);
        if(fromtotal < trnamount) {
            req.flash('errors', `you have not suficeant balance`)
            return res.redirect('back')
        }
        const fromdata = await Account.findById(Accfrom);
        fromdata.transaction = fromdata.transaction.concat({
            walletName:'',
            type: 'Transfer',
            amount: trnamount,
            description: trndesc,
            debit: trnamount,
            credit: 0,
            balance: parseInt(fromtotal) - parseInt(trnamount),
            date: new Date(trandate)
        });
       await fromdata.save();


        
        const toaccou = await Account.aggregate([
            {$match : {_id : {$eq: ObjectId(AccTo) } } },
            {$project: {
                debet: {$sum: "$transaction.debit"},
                credit: {$sum : "$transaction.credit"}
                }
            }
        ]);

        var tototal = parseInt(toaccou[0].credit) - parseInt(toaccou[0].debet);
        const todata = await Account.findById(AccTo);
        todata.transaction = todata.transaction.concat({
            walletName:'',
            type: 'Transfer',
            amount: trnamount,
            description: trndesc,
            debit: 0,
            credit: trnamount,
            balance: parseInt(tototal) + parseInt(trnamount),
            date: new Date(trandate)
        });
        await todata.save();

        req.flash('success', `your transfer success fully done`)
        return res.redirect('back')

    } catch (error) {
        console.log(error);
    }
})

// select to account get router
router.post('/tranAccount', async (req, res)=>{
    const ObjectId = mongoose.Types.ObjectId;
    const toid = req.body.idacc;
    const acc = await Account.aggregate([{$match : {$and: [ 
                                                            {"accTitel": {$ne: 'Receivable'}},
                                                            {"accTitel": {$ne: 'Payable'} },
                                                            {"_id": {$ne: ObjectId(toid)} }
                                                        ] 
                                                    }},
                                            {$project: {_id:1, accTitel:1}}]);

   
    res.status(200).json(acc)
})

router.get('/listdata',async (req, res)=>{
    try {
        const acc = await Account.aggregate([{$match : {$and: [ 
                                                                    {"accTitel": {$ne: 'Receivable'}},
                                                                    {"accTitel": {$ne: 'Payable'} }
                                                                ] 
                }},
            {
                $project: {
                    _id:1,
                    accTitel:1
                }
            }]);
        res.status(201).json(acc);
    } catch (error) {
        console.log(error);
    }
})

module.exports = router