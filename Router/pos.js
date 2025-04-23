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
        const footer = await Shop.findOne({})
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
          discount:1,
          discountType:1,
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
    const footer = await Shop.findOne({})
   
      
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
          discount:1,
          discountType:1,
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
    const footer = await Shop.findOne({})  
  
   
    
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
        const cratOb = cartdata.toObject();
        cratOb.Currency = footer.Currency;
        cratOb.Currency_placement =  1
        return res.status(200).json({
          error: "The product already has been added to the cart",
          data: cratOb,
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
      const cratOb = cart.toObject();
      cratOb.Currency = footer.Currency;
      cratOb.Currency_placement =  1
      
      

      res.status(200).json({
        success: "your product has been added to the cart.",
        data: cratOb,
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
      const cratOb = cart.toObject();
      cratOb.Currency = footer.Currency;
      cratOb.Currency_placement = 1

      res.status(200).json({
        success: "The product has been added to the cart",
        data:cratOb
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
    const quntity = req.body.quntity;
    const cart = await Cart.findOne({});
    const footer = await Shop.findOne({});

    const proQuntity = await Product.aggregate([
      { $match: { Name: { $eq: req.body.proName } } },
      { $project: { _id: 0, quantity: 1 } },
    ]);

    if (quntity > proQuntity[0].quantity) {
      const data = await cart.save();
      const cratOb = data.toObject();
      cratOb.Currency = footer.Currency;
      cratOb.Currency_placement = 1;
      return res.status(201).json({
        error: "Quantity not available in the store",
        data: cratOb,
      });
    }

    let couponRemoved = false;

    cart.item.forEach((pro) => {
      if (pro._id.toString() === req.body.id) {
        const oldcount = pro.productCount;

       
        if (quntity < oldcount) {
          couponRemoved = true;
        }

        pro.productCount = quntity;
        pro.total = (
          (pro.productPrice + pro.tax - pro.discount) * quntity
        ).toFixed(2);

        cart.SubTotal = (
          parseFloat(cart.SubTotal) +
          pro.productPrice * (quntity - oldcount)
        ).toFixed(2);

        cart.Productdiscount = (
          parseFloat(cart.Productdiscount) +
          pro.discount * (quntity - oldcount)
        ).toFixed(2);

        cart.Tax = (
          parseFloat(cart.Tax) +
          pro.tax * (quntity - oldcount)
        ).toFixed(2);

        cart.Amount = (
          parseFloat(cart.SubTotal) +
          parseFloat(cart.Tax) -
          parseFloat(cart.Productdiscount) -
          parseFloat(cart.Coupondiscount || 0)
        ).toFixed(2);
      }
    });

 
    if (couponRemoved && cart.Coupondiscount) {
      cart.Amount = (
        parseFloat(cart.Amount) + parseFloat(cart.Coupondiscount)
      ).toFixed(2);
      cart.Coupondiscount = 0;
      cart.couponCode = null;

      const data = await cart.save();
      const cratOb = data.toObject();
      cratOb.Currency = footer.Currency;
      cratOb.Currency_placement = 1;

      return res.status(201).json({
        error: "Your coupon has been removed due to reduced quantity.",
        data: cratOb,
      });
    }

    const data = await cart.save();
    const cratOb = data.toObject();
    cratOb.Currency = footer.Currency;
    cratOb.Currency_placement = 1;

    res.status(200).json({
      success: "Quantity has been updated!!!",
      data: cratOb,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
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
    const footer = await Shop.findOne({ _id: '67ff457bb265c819e38adcfc' });

    cart.item.forEach(function (pro, index) {
      if (pro._id.toString() == req.params.id) {
        cart.SubTotal = (
          cart.SubTotal - pro.productPrice * pro.productCount
        ).toFixed(2);
        cart.Productdiscount = (
          cart.Productdiscount - pro.discount * pro.productCount
        ).toFixed(2);
        cart.Tax = (cart.Tax - pro.tax * pro.productCount).toFixed(2);
        cart.Amount = (
          cart.SubTotal -
          cart.Productdiscount +
          cart.Tax -
          cart.Coupondiscount
        ).toFixed(2);
        cart.item.splice(index, 1);
      }
    });

  
    if (cart.item.length === 0) {
      cart.SubTotal = 0;
      cart.Productdiscount = 0;
      cart.Tax = 0;
      cart.Amount = 0;
      cart.Coupondiscount = 0;
      cart.couponCode = null;
    }

   

    if (cart.Coupondiscount) {
      const coupon = await Coupon.findOne({ Code: cart.couponCode });
    
        cart.Amount = (
          parseFloat(cart.Amount) + parseFloat(cart.Coupondiscount)
        ).toFixed(2);
        cart.Coupondiscount = 0;
        cart.couponCode = null;

        const data = await cart.save();
        const cratOb = data.toObject();
        cratOb.Currency = footer.Currency;
        cratOb.Currency_placement = 1;

        return res.status(201).json({
          error: `Your coupon has been removed`,
          data: cratOb,
        });
      
    }

    const data = await cart.save();
    const cratOb = data.toObject();
    cratOb.Currency = footer.Currency;
    cratOb.Currency_placement = 1;

    res.status(200).json({
      success: "Successfully removed the item.",
      data: cratOb,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

// add coupon
router.post("/coupon", async (req, res) => {
  try {
    var coupon_code = req.body.code;
    var cart = await Cart.findOne({});
    const footer = await Shop.findOne({})
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

    
 if(cart.coustomerId === ""){
  const newcart = await cart.save();
  const cratOb = newcart.toObject();
  cratOb.Currency = footer.Currency;
  cratOb.Currency_placement = 1;
  return res.status(200).json({
    error: "Please Add Customer",
    data: cratOb,
  });
 }

 if (cart.couponCode && cart.couponCode === coupon_code) {
  const newcart = await cart.save();
  const cratOb = newcart.toObject();
  cratOb.Currency = footer.Currency;
  cratOb.Currency_placement = 1;
  return res.status(201).json({
    error: "Coupon already applied.",
    data: cratOb,
  });
}

    if (coupon.length == 0) {
      const newcart = await cart.save();
      const cratOb = newcart.toObject();
      cratOb.Currency = footer.Currency;
      cratOb.Currency_placement = 1;
      return res.status(200).json({
        error: "This discount is no longer valid.",
        data: cratOb,
      });
    }
    const userrepet = coupon[0].user.filter((id, index) => {
      return id == cart.coustomerId;
    });

    ;
    if (userrepet.length >= coupon[0].limitSame) {
      const newcart = await cart.save();
      const cratOb = newcart.toObject();
      cratOb.Currency = footer.Currency;
      cratOb.Currency_placement = 1;

      return res.status(201).json({
        error: "you are not eligebal for this coupon",
        data: cratOb,
      });
    }

    if (coupon[0].minOrder > cart.Amount) {
      
    const newcart = await cart.save();
    const cratOb = newcart.toObject();
    cratOb.Currency = footer.Currency;
    cratOb.Currency_placement = 1;

      return res.status(201).json({
        error: `minimun ${coupon[0].minOrder} order required.`,
        data: cratOb,
      });
    }
    

    var discount = Number(coupon[0].disAmount.toFixed(2));
    if (coupon[0].disType == "percent") {
      discount = ((cart.Amount * coupon[0].disAmount) / 100).toFixed(2);
        console.log(discount);
        
      if (discount > coupon[0].maxDiscount) {
        discount = coupon[0].maxDiscount.toFixed(2);
      }
    }
  
    
   

    cart.Amount = parseFloat((cart.Amount - (cart.Coupondiscount + Math.floor(discount))).toFixed(2));
   
    cart.Amount =  cart.Amount%1 === 0 ? cart.Amount.toFixed(0) :cart.Amount.toFixed(2)
    cart.Coupondiscount = discount;
    cart.couponCode = coupon_code;

    const newcart = await cart.save();
    const cratOb = newcart.toObject();
    cratOb.Currency = footer.Currency;
    cratOb.Currency_placement = 1;

    res.status(201).json({
      success: `your ${discount} discount has been successfully applied`,
      data: cratOb,
    });
  } catch (error) {
    console.log(error);
  }
});

// remove coupon 
router.get("/removecoupon", async (req, res) => {
  try {
    const cartcupon = await Cart.findOne({});
    const footer = await Shop.findOne({});

    cartcupon.Amount = parseFloat((cartcupon.Amount + cartcupon.Coupondiscount).toFixed(2));
    cartcupon.Amount =  cartcupon.Amount%1 === 0 ? cartcupon.Amount.toFixed(0) :cartcupon.Amount.toFixed(2)

    cartcupon.Coupondiscount = 0;
    cartcupon.couponCode = '';

    const newcart = await cartcupon.save();
    const cratOb = newcart.toObject();
    cratOb.Currency = footer.Currency;
    cratOb.Currency_placement = 1;

    res.status(201).json({
      success: `Coupon is removed`,
      data: cratOb,
    });
  } catch (error) {
    console.error("Error removing coupon:", error);
    res.status(500).json({ error: "Something went wrong" });
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
    const footer = await Shop.findOne({})

    res.status(200).json({
      cart: cart,
      account: account,
      coustomer: coustomer,
      Currency:footer.Currency
    });
  } catch (error) {
    console.log(error);
  }
});

// post order Router
router.post("/order", async (req, res) => {
  try {
    const cart = await Cart.findOne({});

    // Apply coupon logic
    if (cart.couponCode) {
      const coupon = await Coupon.findOne({ Code: cart.couponCode });
      coupon.user.push(cart.coustomerId);
      await coupon.save();
    }

    // Update product quantities
    for (const data of cart.item) {
      const product = await Product.findOne({ Name: data.productName });
      product.quantity -= data.productCount;
      await product.save();
    }

    // Prepare payment method
    const Paymethod = {
      type: "",
      tranRef: req.body.transref || "",
      amount: req.body.colleCash || 0,
      change: req.body.returnCash || 0,
    };

    const accountId = req.body.accounttype;
    if (accountId == 1) {
      Paymethod.type = "Wallet Balance";
      const coustomer = await Coustomer.findOne({ _id: cart.coustomerId });

      if (cart.Amount <= coustomer.Balance) {
        let payableAccoountdetail = await Account.aggregate([
          { $match: { accTitel: "Payable" } },
          {
            $project: {
              debet: { $sum: "$transaction.debit" },
              credit: { $sum: "$transaction.credit" },
            },
          },
        ]);

        let payTotal =
          (parseInt(payableAccoountdetail[0]?.credit) || 0) -
          (parseInt(payableAccoountdetail[0]?.debet) || 0);

        let payableAccoount = await Account.findOne({ accTitel: "Payable" });
        if (!payableAccoount) {
          payableAccoount = new Account({
            accTitel: "Payable",
            accDesscri: "Default",
            transaction: [],
          });
        }

        payableAccoount.transaction.push({
          walletName: cart.coustomerId,
          type: "Payable",
          amount: cart.Amount,
          description: "POS Order",
          debit: cart.Amount,
          credit: 0,
          balance: (payTotal - parseInt(cart.Amount)).toFixed(2),
          date: new Date(),
        });

        await payableAccoount.save();
      } else {
        // Partial from wallet, rest to Receivable
        if (coustomer.Balance > 0) {
          const payableAccoountdetail = await Account.aggregate([
            { $match: { accTitel: "Payable" } },
            {
              $project: {
                debet: { $sum: "$transaction.debit" },
                credit: { $sum: "$transaction.credit" },
              },
            },
          ]);
          let payTotal =
            (parseInt(payableAccoountdetail[0]?.credit) || 0) -
            (parseInt(payableAccoountdetail[0]?.debet) || 0);

          let payableAccoount = await Account.findOne({ accTitel: "Payable" });
          if (!payableAccoount) {
            payableAccoount = new Account({
              accTitel: "Payable",
              accDesscri: "Default",
              transaction: [],
            });
          }

          payableAccoount.transaction.push({
            walletName: cart.coustomerId,
            type: "Payable",
            amount: coustomer.Balance,
            description: "POS Order",
            debit: coustomer.Balance,
            credit: 0,
            balance: (payTotal - parseInt(coustomer.Balance)).toFixed(2),
            date: new Date(),
          });

          await payableAccoount.save();

          // Remaining in receivable
          const remainAmount = parseInt(cart.Amount) - parseInt(coustomer.Balance);

          const recivedAccoountdetail = await Account.aggregate([
            { $match: { accTitel: "Receivable" } },
            {
              $project: {
                debet: { $sum: "$transaction.debit" },
                credit: { $sum: "$transaction.credit" },
              },
            },
          ]);

          let reciTotal =
            (parseInt(recivedAccoountdetail[0]?.credit) || 0) -
            (parseInt(recivedAccoountdetail[0]?.debet) || 0);

          let recivedAccoount = await Account.findOne({ accTitel: "Receivable" });
          if (!recivedAccoount) {
            recivedAccoount = new Account({
              accTitel: "Receivable",
              accDesscri: "Default",
              transaction: [],
            });
          }

          recivedAccoount.transaction.push({
            walletName: cart.coustomerId,
            type: "Receivable",
            amount: remainAmount,
            description: "POS Order",
            debit: 0,
            credit: remainAmount,
            balance: (reciTotal + remainAmount).toFixed(2),
            date: new Date(),
          });

          await recivedAccoount.save();
        } else {
          // Full amount to receivable
          const remainAmount = parseInt(cart.Amount);
          const recivedAccoountdetail = await Account.aggregate([
            { $match: { accTitel: "Receivable" } },
            {
              $project: {
                debet: { $sum: "$transaction.debit" },
                credit: { $sum: "$transaction.credit" },
              },
            },
          ]);

          let reciTotal =
            (parseInt(recivedAccoountdetail[0]?.credit) || 0) -
            (parseInt(recivedAccoountdetail[0]?.debet) || 0);

          let recivedAccoount = await Account.findOne({ accTitel: "Receivable" });
          if (!recivedAccoount) {
            recivedAccoount = new Account({
              accTitel: "Receivable",
              accDesscri: "Default",
              transaction: [],
            });
          }

          recivedAccoount.transaction.push({
            walletName: cart.coustomerId,
            type: "Receivable",
            amount: remainAmount,
            description: "POS Order",
            debit: 0,
            credit: remainAmount,
            balance: (reciTotal + remainAmount).toFixed(2),
            date: new Date(),
          });

          await recivedAccoount.save();
        }
      }

      coustomer.Balance -= parseInt(cart.Amount);
      await coustomer.save();
    } else {
      // Direct account credit
      const accou = await Account.aggregate([
        { $match: { _id: new ObjectId(accountId) } },
        {
          $project: {
            debet: { $sum: "$transaction.debit" },
            credit: { $sum: "$transaction.credit" },
          },
        },
      ]);

      const total = (parseInt(accou[0]?.credit) || 0) - (parseInt(accou[0]?.debet) || 0);
      const data = await Account.findById(accountId);

      data.transaction.push({
        walletName: cart.coustomerId,
        type: "Income",
        amount: cart.Amount,
        description: "POS Order",
        debit: 0,
        credit: cart.Amount,
        balance: (total + parseInt(cart.Amount)).toFixed(2),
        date: new Date(),
      });

      await data.save();
      Paymethod.type = data.accTitel;
    }

    const oreder = new Order({
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

    await Coustomer.findByIdAndUpdate(cart.coustomerId, {
      $push: { order: confirmOrder },
    });

    await Cart.findByIdAndDelete(cart._id);
    req.flash("success", `Your Order has been submitted`);
    return res.redirect("back");
  } catch (error) {
    console.log(error);
    req.flash("errors", "Something went wrong while processing your order.");
    return res.redirect("back");
  }
});

//get order list router
router.get("/orderlist", isAuth, async (req, res) => {
  try {
    const userdata = await User.findOne({ _id: req.user.id });
    const footer = await Shop.findOne({})

    const order = await Order.find({}).lean();
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
    const footer = await Shop.findOne({})

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
          discount:1,
          discountType:1,
        },
      },
    ]);
    const enrichedProducts = product.map(p => ({
      ...p,
      Currency: footer.Currency,
      Currency_placement: 1
    }));
    res.status(201).json({
      success: "success",
      data: enrichedProducts,
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
