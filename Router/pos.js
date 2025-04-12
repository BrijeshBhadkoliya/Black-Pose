const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { isAuth, isAdmin, upload, uploadcsv } = require("../Router/Auth");
const {
  User,
  Category,
  Brand,
  Unit,
  Supplier,
  Product,
  Account,
  Coustomer,
  Cart,
  Coupon,
  Order,
  Shop
} = require("../model/Schema");
const session = require("express-session");
const ObjectId = mongoose.Types.ObjectId;

// POS page get router
router.get("/pos", isAuth, async (req, res) => {
  try {
    const userdata = await User.findOne({ _id: req.user.id });
        const footer = await Shop.findOne({});
    const catList = await Category.aggregate([
      { $match: { status: { $eq: "active" } } },
      { $project: { _id: 1, catName: 1 } },
    ]);
    var activecat = catList.map((data) => {
      return data.catName;
    });

    var match = { category: { $in: activecat } };
    const product = await Product.aggregate([
      { $match: match },
      {
        $project: {
          _id: 1,
          Name: 1,
          proCode: 1,
          sellingPrice: 1,
          productImage: 1,
        },
      },
    ]);

    var costomer = await Coustomer.find({});

    var cart = await Cart.findOne({});
    var coust_name = "";
    var coust_id = "";

    if (cart) {
      if (cart.coustomerId != "") {
        var coustomerName = await Coustomer.aggregate([
          { $match: { _id: { $eq: ObjectId(cart.coustomerId) } } },
          { $project: { _id: 1, cousName: 1 } },
        ]);
        var coust_name = coustomerName[0].cousName;
        var coust_id = coustomerName[0]._id;
      } else {
        var coust_name = "";
        var coust_id = "";
      }
    }
    res.render("pos", {
      success: req.flash("success"),
      errors: req.flash("errors"),
      userdata: userdata,
      list: product,
      catlist: catList,
      catname: "",
      coust: costomer,
      cart: cart,
      coustomerName: coust_name,
      coust_id: coust_id,
  footer
    });
  } catch (error) {
    console.log(error);
  }
});

// POS page serche by category router
router.get("/srchcat/:id", isAuth, async (req, res) => {
  try {
    const userdata = await User.findOne({ _id: req.user.id });
        const footer = await Shop.findOne({});

    const catList = await Category.aggregate([
      { $match: { status: { $eq: "active" } } },
      { $project: { _id: 1, catName: 1 } },
    ]);
    var catname = req.params.id;
    const product = await Product.aggregate([
      { $match: { category: { $eq: catname } } },
      {
        $project: {
          _id: 1,
          Name: 1,
          proCode: 1,
          sellingPrice: 1,
          productImage: 1,
        },
      },
    ]);
    var costomer = await Coustomer.find({});

    var cart = await Cart.findOne({});
    var coust_name = "";
    var coust_id = "";
    if (cart) {
      if (cart.coustomerId != "") {
        var coustomerName = await Coustomer.aggregate([
          { $match: { _id: { $eq: ObjectId(cart.coustomerId) } } },
          { $project: { _id: 1, cousName: 1 } },
        ]);
        var coust_name = coustomerName[0].cousName;
        var coust_id = coustomerName[0]._id;
      } else {
        var coust_name = "";
        var coust_id = "";
      }
    }

    res.render("pos", {
      success: req.flash("success"),
      errors: req.flash("errors"),
      userdata: userdata,
      list: product,
      catlist: catList,
      catname: catname,
      coust: costomer,
      cart: cart,
      coustomerName: coust_name,
      coust_id: coust_id,
      footer
    });
  } catch (error) {
    console.log(error);
  }
});

//add to cart router
router.post("/addCart", async (req, res) => {
  try {
    const product = await Product.findById(req.body.id);
    const cartdata = await Cart.findOne({ coustomerId: req.body.coust_id });
    
    var discount = product.discount.toFixed(2);
    if (product.discountType == "percent") {
      discount = (
        (parseInt(product.sellingPrice) * parseInt(product.discount)) /
        100
      ).toFixed(2);
    }
    var tax = (
      (parseInt(product.sellingPrice) * parseInt(product.tax)) /
      100
    ).toFixed(2);
    var total = (
      parseInt(product.sellingPrice) -
      parseInt(discount) +
      parseInt(tax)
    ).toFixed(2);

    if (product.quantity <= 0) {
      return res.status(200).json({
        error: "This Product currently not avaliabal",
        data: cartdata,
      });
    }

    if (cartdata) {
      var cartitemavailabal = "";
      cartdata.item.forEach((data) => {
        data.productName == product.Name ? (cartitemavailabal = "true") : "";
      });

      if (cartitemavailabal == "true") {
        return res.status(200).json({
          error: "The product already has been added to the cart",
          data: cartdata,
        });
      }

      cartdata.item = cartdata.item.concat({
        productName: product.Name,
        productCount: 1,
        productPrice: product.sellingPrice,
        discount: discount,
        tax: tax,
        total: total,
      
      });
      (cartdata.SubTotal =
        parseInt(cartdata.SubTotal) + parseInt(product.sellingPrice)),
        (cartdata.Productdiscount =
          parseInt(cartdata.Productdiscount) + parseInt(discount));
      cartdata.Tax = parseInt(cartdata.Tax) + parseInt(tax);
      cartdata.Amount = parseInt(cartdata.Amount) + parseInt(total);

      const cart = await cartdata.save();

      res.status(200).json({
        success: "your product has been added to the cart.",
        data: cart,
      });
    } else {
      const data = new Cart({
        item: [
          {
            productName: product.Name,
            productCount: 1,
            productPrice: product.sellingPrice,
            discount: discount,
            tax: tax,
            total: total,
          },
        ],
        SubTotal: product.sellingPrice,
        Productdiscount: discount,
        Tax: tax,
        Coupondiscount: 0,
        Amount: total,
        coustomerId: req.body.coust_id,
        cartNote: "",
      });

      const cart = await data.save();
 
     const footer = await Shop.findOne({})  
      res.status(200).json({
        success: "The product has been added to the cart",
        data: cart,
        footer
      });
    }
  } catch (error) {
    console.log(error);
  }
});



//////cart user id post router
router.post("/userId", async (req, res) => {
  try {
    const cartdata = await Cart.findOne({});

    if (cartdata) {
      cartdata.coustomerId = req.body.userId;
      var cart = await cartdata.save();
    } else {
      const data = new Cart({
        item: [],
        SubTotal: 0,
        Productdiscount: 0,
        Tax: 0,
        Coupondiscount: 0,
        Amount: 0,
        coustomerId: req.body.userId,
        cartNote: "",
      });

      var cart = await data.save();
    }

    const coustomerName = await Coustomer.aggregate([
      { $match: { _id: { $eq: ObjectId(req.body.userId) } } },
      { $project: { _id: 0, cousName: 1 } },
    ]);
    res.status(200).json({
      success: "success",
      coust_name: coustomerName[0].cousName,
      coust_id: coustomerName[0]._id,
    });
  } catch (error) {
    console.log(error);
  }
});

///delet cart item
router.get("/delet", async (req, res) => {
  try {
    const cart = await Cart.findOne({});
    if (cart) {
      const delet = await Cart.findByIdAndDelete(cart._id);
    }
    res.redirect("/user/pos");
  } catch (error) {
    console.log(error);
  }
});

///change product Quntity
router.post("/quntity", async (req, res) => {
  try {
    var quntity = req.body.quntity;
    const cart = await Cart.findOne({});
    const proQuntity = await Product.aggregate([
      { $match: { Name: { $eq: req.body.proName } } },
      { $project: { _id: 0, quantity: 1 } },
    ]);

    if (quntity > proQuntity[0].quantity) {
      return res.status(201).json({
        error: "Quantity not available in the store",
        data: cart,
      });
    }
    cart.item.forEach(function (pro) {
      if (pro._id.toString() == req.body.id) {
        var oldcount = pro.productCount;
        pro.productCount = quntity;
        pro.total = (
          (pro.productPrice + pro.tax - pro.discount) *
          quntity
        ).toFixed(2);
        cart.SubTotal = (
          cart.SubTotal +
          pro.productPrice * (quntity - oldcount)
        ).toFixed(2);
        cart.Productdiscount = (
          cart.Productdiscount +
          pro.discount * (quntity - oldcount)
        ).toFixed(2);
        cart.Tax = (cart.Tax + pro.tax * (quntity - oldcount)).toFixed(2);
        cart.Amount = (
          cart.SubTotal +
          cart.Tax -
          cart.Productdiscount -
          cart.Coupondiscount
        ).toFixed(2);
      }
    });

    var data = await cart.save();

    res.status(200).json({
      success: "Quantity has been updated!!!",
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
});

// add cart note;
router.post("/note", async (req, res) => {
  try {
    const cartdata = await Cart.findOne({});

    if (cartdata) {
      cartdata.cartNote = req.body.note;
      var cart = await cartdata.save();
    } else {
      const data = new Cart({
        item: [],
        SubTotal: 0,
        Productdiscount: 0,
        Tax: 0,
        Coupondiscount: 0,
        Amount: 0,
        coustomerId: "",
        cartNote: req.body.note,
      });

      var cart = await data.save();
    }

    const coustomerName = await Coustomer.aggregate([
      { $match: { _id: { $eq: ObjectId(req.body.userId) } } },
      { $project: { _id: 0, cousName: 1 } },
    ]);

    res.status(200).json({
      success: "Added a special comment for this order",
      note: cart.cartNote,
    });
  } catch (error) {
    console.log(error);
  }
});

//delet cart item
router.get("/deletitem/:id", async (req, res) => {
  try {
    const cart = await Cart.findOne({});

    cart.item.forEach(function (pro, index) {
      if (pro._id.toString() == req.params.id) {
        cart.SubTotal = (
          cart.SubTotal -
          pro.productPrice * pro.productCount
        ).toFixed(2);
        cart.Productdiscount = (
          cart.Productdiscount -
          pro.discount * pro.productCount
        ).toFixed(2);
        cart.Tax = (cart.Tax - pro.tax * pro.productCount).toFixed(2);
        cart.Amount = (
          cart.SubTotal +
          cart.Tax -
          cart.Productdiscount -
          cart.Coupondiscount
        ).toFixed(2);
        cart.item.splice(index, 1);
      }
    });

    var data = await cart.save();

    res.status(200).json({
      success: "Successfully removing the item.",
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
});

// add coupon
router.post("/coupon", async (req, res) => {
  try {
    var coupon_code = req.body.code;
    var cart = await Cart.findOne({});
    var coupon = await Coupon.aggregate([
      {
        $match: {
          $and: [
            { Code: { $eq: coupon_code } },
            { status: { $eq: "active" } },
            { startDate: { $lte: new Date() } },
            { endDate: { $gte: new Date() } },
          ],
        },
      },
    ]);

    console.log(coupon_code);
    console.log(coupon);

    if (coupon.length == 0) {
      return res.status(200).json({
        error: "This discount is no longer valid.",
        data: cart,
      });
    }
    const userrepet = coupon[0].user.filter((id, index) => {
      return id == cart.coustomerId;
    });

    console.log(userrepet);
    if (userrepet.length >= coupon[0].limitSame) {
      return res.status(201).json({
        error: "you are not eligebal for this coupon",
        data: cart,
      });
    }

    if (coupon[0].minOrder > cart.Amount) {
      return res.status(201).json({
        error: `minimun ${coupon[0].minOrder} order required.`,
        data: cart,
      });
    }
    console.log(coupon[0].disAmount);

    var discount = Number(coupon[0].disAmount.toFixed(2));
    if (coupon[0].disType == "percent") {
      discount = ((cart.Amount * coupon[0].disAmount) / 100).toFixed(2);

      if (discount > coupon[0].maxDiscount) {
        discount = coupon[0].maxDiscount.toFixed(2);
      }
    }
    // console.log(cart);
    console.log(discount);

    cart.Amount = cart.Amount - cart.Coupondiscount + discount;
    cart.Coupondiscount = discount;
    cart.couponCode = coupon_code;
    const newcart = await cart.save();
    res.status(201).json({
      success: `your ${discount} discount has been successfully applied`,
      data: newcart,
    });
  } catch (error) {
    console.log(error);
  }
});

// get payment Router
router.get("/payment", async (req, res) => {
  try {
    var cart = await Cart.findOne({});
    const account = await Account.aggregate([
      {
        $match: {
          $and: [
            { accTitel: { $ne: "Receivable" } },
            { accTitel: { $ne: "Payable" } },
          ],
        },
      },
      { $project: { _id: 1, accTitel: 1 } },
    ]);

    if (cart.coustomerId == "") {
      return res.status(201).json({
        error: "please select coustomer",
        data: cart,
      });
    }
    const coustomer = await Coustomer.findOne({ _id: cart.coustomerId });

    res.status(200).json({
      cart: cart,
      account: account,
      coustomer: coustomer,
    });
  } catch (error) {
    console.log(error);
  }
});

// post order Router
router.post("/order", async (req, res) => {
  try {
    var cart = await Cart.findOne({});

    //*******if coupon applied then save coustomer id to this coupon user detail*************/
    if (cart.couponCode) {
      var coupon = await Coupon.findOne({ Code: cart.couponCode });
      coupon.user.push(cart.coustomerId);
      await coupon.save();
    }

    //********change quntity of product available in store */
    cart.item.forEach(async function (data) {
      var product = await Product.findOne({ Name: data.productName });
      product.quantity = product.quantity - data.productCount;
      await product.save();
    });

    var Paymethod = {
      type: "",
      tranRef: "",
      amount: 0,
      change: 0,
    };
    if (req.body.transref) {
      Paymethod.tranRef = req.body.transref;
    }
    if (req.body.colleCash) {
      Paymethod.amount = req.body.colleCash;
    }
    if (req.body.returnCash) {
      Paymethod.change = req.body.returnCash;
    }

    //**********save payment******** */
    var accountId = req.body.accounttype;
    if (accountId == 1) {
      Paymethod.type = "Wallet Balance";
      //payment from wallet account
      const coustomer = await Coustomer.findOne({ _id: cart.coustomerId });
      // if order amount is less then wallet balance then debet from payabale account
      if (cart.Amount <= coustomer.Balance) {
        const payableAccoountdetail = await Account.aggregate([
          { $match: { accTitel: { $eq: "Payable" } } },
          {
            $project: {
              debet: { $sum: "$transaction.debit" },
              credit: { $sum: "$transaction.credit" },
            },
          },
        ]);
        var payTotal =
          parseInt(payableAccoountdetail[0].credit) -
          parseInt(payableAccoountdetail[0].debet);
        var payableAccoount = await Account.findOne({ accTitel: "Payable" });
        payableAccoount.transaction = payableAccoount.transaction.concat({
          walletName: cart.coustomerId,
          type: "Payable",
          amount: cart.Amount,
          description: "POS Order",
          debit: cart.Amount,
          credit: 0,
          balance: (parseInt(payTotal) - parseInt(cart.Amount)).toFixed(2),
          date: new Date(),
        });
        await payableAccoount.save();
      } else {
        //******* if order amount is gretar then wallet balance then debet from payabale account as availabale*/

        if (coustomer.Balance > 0) {
          //***step 1 all wallet amount debit from payable account */
          const payableAccoountdetail = await Account.aggregate([
            { $match: { accTitel: { $eq: "Payable" } } },
            {
              $project: {
                debet: { $sum: "$transaction.debit" },
                credit: { $sum: "$transaction.credit" },
              },
            },
          ]);
          var payTotal =
            parseInt(payableAccoountdetail[0].credit) -
            parseInt(payableAccoountdetail[0].debet);
          var payableAccoount = await Account.findOne({ accTitel: "Payable" });
          payableAccoount.transaction = payableAccoount.transaction.concat({
            walletName: cart.coustomerId,
            type: "Payable",
            amount: coustomer.Balance,
            description: "POS Order",
            debit: coustomer.Balance,
            credit: 0,
            balance: (parseInt(payTotal) - parseInt(coustomer.Balance)).toFixed(
              2
            ),
            date: new Date(),
          });
          await payableAccoount.save();

          //***step 2 remain amount credit in reciveable account */
          var remainAmount =
            parseInt(cart.Amount) - parseInt(coustomer.Balance);
          const recivedAccoountdetail = await Account.aggregate([
            { $match: { accTitel: { $eq: "Receivable" } } },
            {
              $project: {
                debet: { $sum: "$transaction.debit" },
                credit: { $sum: "$transaction.credit" },
              },
            },
          ]);
          var reciTotal =
            parseInt(recivedAccoountdetail[0].credit) -
            parseInt(recivedAccoountdetail[0].debet);
          var recivedAccoount = await Account.findOne({
            accTitel: "Receivable",
          });
          recivedAccoount.transaction = recivedAccoount.transaction.concat({
            walletName: cart.coustomerId,
            type: "Recivebal",
            amount: remainAmount,
            description: "POS Order",
            debit: 0,
            credit: remainAmount,
            balance: (parseInt(reciTotal) + parseInt(remainAmount)).toFixed(2),
            date: new Date(),
          });
          await recivedAccoount.save();
        } else {
          //***cart amount credit in reciveable account */
          var remainAmount =
            parseInt(cart.Amount) - parseInt(coustomer.Balance);
          const recivedAccoountdetail = await Account.aggregate([
            { $match: { accTitel: { $eq: "Receivable" } } },
            {
              $project: {
                debet: { $sum: "$transaction.debit" },
                credit: { $sum: "$transaction.credit" },
              },
            },
          ]);
          var reciTotal =
            parseInt(recivedAccoountdetail[0].credit) -
            parseInt(recivedAccoountdetail[0].debet);
          var recivedAccoount = await Account.findOne({
            accTitel: "Receivable",
          });
          recivedAccoount.transaction = recivedAccoount.transaction.concat({
            walletName: cart.coustomerId,
            type: "Recivebal",
            amount: cart.Amount,
            description: "POS Order",
            debit: 0,
            credit: cart.Amount,
            balance: (parseInt(reciTotal) + parseInt(cart.Amount)).toFixed(2),
            date: new Date(),
          });
          await recivedAccoount.save();
        }
      }
      coustomer.Balance = parseInt(coustomer.Balance) - parseInt(cart.Amount);
      await coustomer.save();
    } else {
      //******Add balance in transection account*** */
      const accou = await Account.aggregate([
        { $match: { _id: { $eq: ObjectId(accountId) } } },
        {
          $project: {
            debet: { $sum: "$transaction.debit" },
            credit: { $sum: "$transaction.credit" },
          },
        },
      ]);

      var total = parseInt(accou[0].credit) - parseInt(accou[0].debet);
      const data = await Account.findById(accountId);
      data.transaction = data.transaction.concat({
        walletName: cart.coustomerId,
        type: "Income",
        amount: cart.Amount,
        description: "POS Order",
        debit: 0,
        credit: cart.Amount,
        balance: (parseInt(total) + parseInt(cart.Amount)).toFixed(2),
        date: new Date(),
      });
      await data.save();
      Paymethod.type = data.accTitel;
    }

    var oreder = new Order({
      item: cart.item,
      SubTotal: cart.SubTotal,
      Productdiscount: cart.Productdiscount,
      Coupondiscount: cart.Coupondiscount,
      Tax: cart.Tax,
      Amount: cart.Amount,
      coustomerId: cart.coustomerId,
      cartNote: cart.cartNote,
      paymentMethod: Paymethod,
    });

    const confirmOrder = await oreder.save();
    // update code 
    await Coustomer.findByIdAndUpdate(
      cart.coustomerId,
      { $push: { order: confirmOrder } }
    );

    const cleareCart = await Cart.findByIdAndDelete(cart._id);
    req.flash("success", `Your Order has been submitted`);

    return res.redirect("back");
  } catch (error) {
    console.log(error);
  }
});

//get order list router
router.get("/orderlist", isAuth, async (req, res) => {
  try {
    const userdata = await User.findOne({ _id: req.user.id });
    const footer = await Shop.findOne({});

    const order = await Order.find({});

    res.render("order", {
      success: req.flash("success"),
      errors: req.flash("errors"),
      userdata: userdata,
      data: order,
      footer
    });
  } catch (error) {
    console.log(error);
  }
});

//product list get router for ajex
router.get("/productList", async (req, res) => {
  try {
    const catList = await Category.aggregate([
      { $match: { status: { $eq: "active" } } },
      { $project: { _id: 1, catName: 1 } },
    ]);
    var activecat = catList.map((data) => {
      return data.catName;
    });

    var match = { category: { $in: activecat } };
    const product = await Product.aggregate([
      { $match: match },
      {
        $project: {
          _id: 1,
          Name: 1,
          proCode: 1,
          sellingPrice: 1,
          productImage: 1,
        },
      },
    ]);

    res.status(201).json({
      success: "success",
      data: product,
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
