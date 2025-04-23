const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const { isAuth, isAdmin, upload } = require('../Router/Auth');
const { User, Category, Coustomer, UserRole, Account, Order, Shop } = require('../model/Schema');

// add coustomer get router
router.get('/add', isAuth, async (req, res) => {
    try {
        const userdata = await User.findOne({ _id: req.user.id })
            const footer = await Shop.findOne({})

            res.render('addCoustomer', {
                success: req.flash('success'),
                errors: req.flash('errors'),
                userdata: userdata,
                footer
            })
    } catch (error) {
        console.log(error);
    }
});

// add coustomer post router
router.post('/coustomer-add', upload.single("couImg"), async (req, res) => {
    try {

        const { cousName, cousMobile, cousEmail, cousAddres, cousState, cousPINcode } = req.body;
        
        const missingF = Object.entries(req.body)
      .filter(([key, val]) => val.trim() === "")
      .map(([key]) => key);
    
    if (missingF.length > 0) {
      req.flash("errors", `Missing fields: ${missingF.join(", ")}`);
      return res.redirect("back");
    } 
        const cousImage = req.file.filename;

        const mobile = await Coustomer.findOne({ cousMobile: cousMobile });

        if (mobile) {
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
                path.resolve(req.file.destination, 'resized', image)
            )

        fs.unlinkSync(req.file.path)


        const newCat = await Coustomer.create({ cousName, cousMobile, cousEmail, cousAddres, cousState, cousPINcode, cousImage });

        req.flash('success', `${cousName} Add success fuly`)
        res.redirect('/coustomer/list')

    } catch (error) {
        console.log(error);
    }
})

// update coustomer get router
router.get('/update/:id', isAuth, async (req, res) => {
    try {
        const userdata = await User.findOne({ _id: req.user.id })
            const cost = await Coustomer.findById(req.params.id)
            const footer = await Shop.findOne({})
            res.render('updateCoustomer', {
                success: req.flash('success'),
                errors: req.flash('errors'),
                userdata: userdata,
                data: cost,
                footer
            })
            return res.redirect("back")
    } catch (error) {
        console.log(error);
    }
});

//update coustomer post router
router.post('/coustomer-update/:id', isAuth, upload.single("couImg"), async (req, res) => {
    try {



        const coustom = await Coustomer.findById({ _id: req.params.id })

        const missingF = Object.entries(req.body)
        .filter(([key, val]) => val.trim() === "")
        .map(([key]) => key);
      
      if (missingF.length > 0) {
        req.flash("errors", `Missing fields: ${missingF.join(", ")}`);
        return res.redirect("back");
      }

        const cousName = req.body.cousName
        const cousMobile = req.body.cousMobile
        const cousEmail = req.body.cousEmail
        const cousAddres = req.body.cousAddres
        const cousState = req.body.cousState
        const cousPINcode = req.body.cousPINcode


        const cosmob = await Coustomer.findOne({ cousMobile: cousMobile, _id: { $ne: req.params.id } });

        if (cosmob) {
            if (req.file) {
                fs.unlinkSync(req.file.path)
            }

            req.flash('errors', `${cousMobile} alredy added please choose onother`)
            return res.redirect('back')
        }


        coustom.cousName = cousName
        coustom.cousMobile = cousMobile
        coustom.cousEmail = cousEmail
        coustom.cousAddres = cousAddres
        coustom.cousState = cousState
        coustom.cousPINcode = cousPINcode

        if (req.file) {
             
            if (coustom?.cousImage) {
                  const oldImagePath = path.join(__dirname, '../public/uploads/resized/', coustom.cousImage);
                  try {
                    if (fs.existsSync(oldImagePath)) {
                      fs.unlinkSync(oldImagePath);
                    }
                  } catch (err) {
                    console.error("Error deleting old image:", err);
                  }
                }
            //*****resized image */
            const { filename: image } = req.file;
            await sharp(req.file.path)
                .resize(200, 200)
                .jpeg({ quality: 90 })
                .toFile(
                    path.resolve(req.file.destination, 'resized', image)
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
router.get('/list', isAuth, async (req, res) => {
    try {
        const userdata = await User.findOne({ _id: req.user.id })
        const footer = await Shop.findOne({})
        const costList = await Coustomer.find({});
            res.render('coustomer', {
                success: req.flash('success'),
                errors: req.flash('errors'),
                userdata: userdata,
                data: costList,
                footer,
            })
        
    } catch (error) {
        console.log(error);
    }
});

// update coustomer balance
router.post('/balance', async (req, res) => {
    var balance = req.body.balance
    const data = await Coustomer.findById(req.body.addbal);
    data.Balance = parseInt(data.Balance) + parseInt(balance);
    await data.save();

    res.redirect('back')

});

//delet coustomer
router.get('/delet/:id', isAuth, async (req, res) => {
    try {
        const cuotomimg = await Coustomer.findById(req.params.id)
          if (cuotomimg?.cousImage) {
                const oldImagePath = path.join(__dirname, '../public/uploads/resized/', cuotomimg.cousImage);
                try {
                  if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                  }
                } catch (err) {
                  console.error("Error deleting old image:", err);
                }
              }

        const del = await Coustomer.findByIdAndDelete(req.params.id)
        req.flash('success', `${del.cousName} Delet success fuly`)
        res.redirect('/coustomer/list')

    } catch (error) {
        console.log(error);
    }
})


// coustomer views Order List page
router.get('/views/:id', isAuth, async (req, res) => {
    try {
        const userdata = await User.findOne({ _id: req.user.id })
        const footer = await Shop.findOne({})

        const cost = await Coustomer.findById({ _id: req.params.id });
        const order = await Order.find({ coustomerId: req.params.id })


        res.render('costomerListView', {
            success: req.flash('success'),
            errors: req.flash('errors'),
            userdata: userdata,
            footer,
            data: cost,
            order: order
        })



    } catch (error) {
        console.log(error);
    }
});

// coustomer views Transection List page
router.get('/viewtransection/:id', isAuth, async (req, res) => {
    try {
        var id = req.params.id
        const userdata = await User.findOne({ _id: req.user.id })
        const footer = await Shop.findOne({})

        const cost = await Coustomer.findById({ _id: req.params.id });
        const transList = await Account.aggregate([
            { $unwind: "$transaction" },
            { $match: { "transaction.walletName": { $eq: id } } },
            {
                $project: {
                    _id: 0,
                    accDesscri: 0,
                    accNumber: 0,
                    createdAt: 0,
                    updatedAt: 0
                }
            }
        ]);

        res.render('coustomerListTransection', {
            success: req.flash('success'),
            errors: req.flash('errors'),
            userdata: userdata,
            data: cost,
            list: transList,
            footer,
        })



    } catch (error) {
        console.log(error);
    }
});


//order invoice download get router
router.get('/invoice/:id', async (req, res) => {
    const order = await Order.findById(req.params.id)
    const footer = await Shop.findOne({})

    res.status(200).json({
        status: 'success',
        data: order,
        footer
    })

})
module.exports = router