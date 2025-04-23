const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const sharp = require('sharp');
const path = require('path')
const fs = require('fs');
const { isAuth, isAdmin, upload, uploadcsv, income } = require('../Router/Auth');
const { User, Category, Brand, Unit, Supplier, UserRole, Product, Account, Coustomer, Shop } = require('../model/Schema');



//add wallet Income Post router
router.post('/add/:id', isAuth, async (req, res) => {
    try {
        const ObjectId = mongoose.Types.ObjectId;
        const { balance, disc, balAcc, date } = req.body;


        //************************  Add balance in Coustomer selected Account ************/
        const accou = await Account.aggregate([
            { $match: { _id: { $eq: ObjectId(balAcc) } } },
            {
                $project: {
                    debet: { $sum: "$transaction.debit" },
                    credit: { $sum: "$transaction.credit" }
                }
            }
        ]);

        var total = parseInt(accou[0].credit) - parseInt(accou[0].debet);
        const data = await Account.findById(balAcc);
        data.transaction = data.transaction.concat({
            walletName: req.params.id,
            type: 'Income',
            amount: balance,
            description: disc,
            debit: 0,
            credit: balance,
            balance: parseInt(total) + parseInt(balance),
            date: new Date(date)
        });
        await data.save();
        //************************  Add balance in Coustomer selected Account done************/

        const coustomer = await Coustomer.findById(req.params.id);

        if (coustomer.Balance < 0) {                          // if coustomer balance is negative

            var lepsAmount = - parseInt(coustomer.Balance); // total leps amount


            if (lepsAmount >= balance) {                      // if leps amount is greter then add balance

                //**********  Add balance in recived account************/
                const recivedAccoountdetail = await Account.aggregate([
                    { $match: { accTitel: { $eq: "Receivable" } } },
                    {
                        $project: {
                            debet: { $sum: "$transaction.debit" },
                            credit: { $sum: "$transaction.credit" }
                        }
                    }
                ]);
                var reciTotal = parseInt(recivedAccoountdetail[0].credit) - parseInt(recivedAccoountdetail[0].debet)


                var recivedAccoount = await Account.findOne({ accTitel: "Receivable" });


                if (!recivedAccoount) {
                    recivedAccoount = new Account({
                        accTitel: "Receivable",
                        accDesscri: "Default",
                        transaction: []
                    })
                }

                recivedAccoount.transaction = recivedAccoount.transaction.concat({
                    walletName: req.params.id,
                    type: 'Recivebal',
                    amount: balance,
                    description: disc,
                    debit: 0,
                    credit: balance,
                    balance: parseInt(reciTotal) + parseInt(balance),
                    date: new Date(date)
                })
                await recivedAccoount.save()


            } else {  // if leps amount is less then add balance

                //**********  Add leps amount balance in recived account************/
                const recivedAccoountdetail = await Account.aggregate([
                    { $match: { accTitel: { $eq: "Receivable" } } },
                    {
                        $project: {
                            debet: { $sum: "$transaction.debit" },
                            credit: { $sum: "$transaction.credit" }
                        }
                    }
                ]);
                var reciTotal = parseInt(recivedAccoountdetail[0].credit) - parseInt(recivedAccoountdetail[0].debet)


                var recivedAccoount = await Account.findOne({ accTitel: "Receivable" });

                if (!recivedAccoount) {
                    recivedAccoount = new Account({
                        accTitel: "Receivable",
                        accDesscri: "Default",
                        transaction: []
                    })
                }


                recivedAccoount.transaction = recivedAccoount.transaction.concat({
                    walletName: req.params.id,
                    type: 'Recivebal',
                    amount: lepsAmount,
                    description: disc,
                    debit: 0,
                    credit: lepsAmount,
                    balance: parseInt(reciTotal) + parseInt(lepsAmount),
                    date: new Date(date)
                })
                await recivedAccoount.save()

                //**********  Add remain amount in Paybale account************/
                var remain = parseInt(balance) - parseInt(lepsAmount)

                const payableAccoountdetail = await Account.aggregate([
                    { $match: { accTitel: { $eq: "Payable" } } },
                    {
                        $project: {
                            debet: { $sum: "$transaction.debit" },
                            credit: { $sum: "$transaction.credit" }
                        }
                    }
                ]);
                var payTotal = parseInt(payableAccoountdetail[0].credit) - parseInt(payableAccoountdetail[0].debet)


                var payableAccoount = await Account.findOne({ accTitel: "Payable" });

                if (!payableAccoount) {
                    payableAccoount = new Account({
                        accTitel: "Payable",
                        accDesscri: "Default",
                        transaction: []
                    })
                }


                payableAccoount.transaction = payableAccoount.transaction.concat({
                    walletName: req.params.id,
                    type: 'Payable',
                    amount: remain,
                    description: disc,
                    debit: 0,
                    credit: remain,
                    balance: parseInt(payTotal) + parseInt(remain),
                    date: new Date(date)
                })
                await payableAccoount.save()

            }

        } else {              // if coustomer balance is positive

            //**********  Add balance in Paybale account************/

            const payableAccoountdetail = await Account.aggregate([
                { $match: { accTitel: { $eq: "Payable" } } },
                {
                    $project: {
                        debet: { $sum: "$transaction.debit" },
                        credit: { $sum: "$transaction.credit" }
                    }
                }
            ]);
            var payTotal = parseInt(payableAccoountdetail[0].credit) - parseInt(payableAccoountdetail[0].debet)


            var payableAccoount = await Account.findOne({ accTitel: "Payable" });

            if (!payableAccoount) {
                payableAccoount = new Account({
                    accTitel: "Payable",
                    accDesscri: "Default",
                    transaction: []
                })
            }

            payableAccoount.transaction = payableAccoount.transaction.concat({
                walletName: req.params.id,
                type: 'Payable',
                amount: balance,
                description: disc,
                debit: 0,
                credit: balance,
                balance: parseInt(payTotal) + parseInt(balance),
                date: new Date(date)
            })
            await payableAccoount.save()

        }





        coustomer.Balance = parseInt(coustomer.Balance) + parseInt(balance);

        await coustomer.save();

        req.flash('success', `your Wallet balance update success fully`)
        return res.redirect('back')

    } catch (error) {
        console.log(error);
    }
})

//home page and shop seting router
router.get('/home', isAuth, async (req, res) => {

    const data = await Shop.findOne({})
    const userdata = await User.findOne({ _id: req.user.id });
  
      
    res.render('home', {
        success: req.flash('success'),
        errors: req.flash('errors'),
        userdata: userdata,
        data: data,
        footer: data,
        dataid: data?._id
    })
});

//home page and shop seting POST router
router.post('/setting/:id', upload.single("Logo"), async (req, res) => {
    try {
        const shopId = req.params.id;
        let data = await Shop.findById(shopId);

        // If no shop exists, create a new one with that _id
        if (!data) {
            data = new Shop({ _id: new mongoose.Types.ObjectId(shopId) });
        }

        const { ShopName, Shopphone, VAT, Country, Currency, Timezone, Reorderlevel, Shopemail, Shopaddress, Footer } = req.body;

        if (req.file) {

            if (data?.Logo) {
                const oldImagePath = path.join(__dirname, '../public/uploads/resized/', data.Logo);
                try {
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                } catch (err) {
                    console.error("Error deleting old image:", err);
                }
            }

            const { filename: image } = req.file;
            data.Logo = image;

            // Resize and move image
            await sharp(req.file.path).toFile(path.resolve(req.file.destination, 'resized', image));

            fs.unlinkSync(req.file.path);  
        }

        // Update other fields
        data.ShopName = ShopName;
        data.Shopphone = Shopphone;
        data.VAT = VAT;
        data.Country = Country;
        data.Currency = Currency;
        data.Timezone = Timezone;
        data.Reorderlevel = Reorderlevel;
        data.Shopemail = Shopemail;
        data.Shopaddress = Shopaddress;
        data.Footer = Footer;

        await data.save();

        req.flash('success', 'Your setting was saved successfully!');
        res.redirect('back');
    } catch (error) {
        console.error(error);
        req.flash('errors', 'Something went wrong. Please try again.');
        res.redirect('back');
    }
});
module.exports = router