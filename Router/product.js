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
  UserRole,
  Shop,
} = require("../model/Schema");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
var csv = require("fast-csv");
const { parse } = require("fast-csv");
var Excel = require("exceljs");

// add product get router
router.get("/add", isAuth, async (req, res) => {
  try {
      const brand = await Brand.find({});
      const unit = await Unit.find({});
      const category = await Category.find({ status: "active" });
      const supp = await Supplier.find({});
      const userdata = await User.findOne({ _id: req.user.id });
      const footer = await Shop.findOne({})
      res.render("product", {
        success: req.flash("success"),
        errors: req.flash("errors"),
        userdata: userdata,
        brand: brand,
        unit: unit,
        category: category,
        supp: supp,
        footer,
      });
  } catch (error) {
    console.log(error);
  }
});
// add Product post router

router.get("/subcate", async (req, res) => {
  try {
    if (req.query.cat) {
      const subcatfind = await Category.findOne({ catName: req.query.cat });

      if (!subcatfind) {
        return res.status(404).send({ subcat: [] });
      }

      const subCategoryNames = subcatfind.subcatNames.map(
        (sub) => sub.subcatname
      );

      return res.send({
        subcat: subCategoryNames,
      });
    } else {
      return res.status(400).send({ error: "Category not provided." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server error" });
  }
});


router.post("/addproduct", upload.single("proimg"), async (req, res) => {
  try {
    const { filename: image } = req.file;
    const {
      Name,
      proCode,
      brand,
      quantity,
      unitType,
      unitValue,
      category,
      SubCategory,
      sellingPrice,
      purchasePrice,
      discountType,
      discount,
      tax,
      supplier,
    } = req.body;
    const productImage = req.file.filename;



    const missingF = Object.entries(req.body)
    .filter(([key, val]) => val.trim() === "")
    .map(([key]) => key);
  
  if (missingF.length > 0) {
    req.flash("errors", `Missing fields: ${missingF.join(", ")}`);
    return res.redirect("back");
  }


    const proname = await Product.findOne({ Name: Name });
    if (proname) {
      fs.unlinkSync(req.file.path);
      req.flash("errors", `${Name} alredy added please choose onother`);
      return res.redirect("/product/add");
    }

    const pcode = await Product.findOne({ proCode: proCode });
    if (pcode) {
      fs.unlinkSync(req.file.path);
      req.flash(
        "errors",
        ` Same Product Code Faund.......${proCode} alredy added please choose onother`
      );
      return res.redirect("/product/add");
    }

    await sharp(req.file.path)
      .resize(200, 200)
      .jpeg({ quality: 90 })
      .toFile(path.resolve(req.file.destination, "resized", image));

      

    fs.unlinkSync(req.file.path);

    const newProduct = await Product.create({
      Name,
      proCode,
      brand,
      quantity,
      unitType,
      unitValue,
      category,
      SubCategory,
      sellingPrice,
      purchasePrice,
      discountType,
      discount,
      tax,
      supplier,
      productImage,
    });
    const supp = await Supplier.findOne({ suppName: supplier });

    
    supp.productList = supp.productList.concat({
      productName: newProduct.Name,
    });
    await supp.save();

    //******************* Add Supplier payabale Amount********************** */
    var totalAmount = parseInt(purchasePrice) * parseInt(quantity);
    //****** save new Order detail in supplier data */
    const supplierdata = await Supplier.findOne({ suppName: supplier });
    supplierdata.orderList = supplierdata.orderList.concat({
      productName: Name,
      productQuntity: quantity,
      productPrice: purchasePrice,
      totalAmount: totalAmount,
      date: Date.now(),
    });

    var id = supplierdata._id;
    await supplierdata.save();

    //**********  Add balance in Paybale account************/

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
      parseInt(payableAccoountdetail[0]?.credit) || 0-
      parseInt(payableAccoountdetail[0]?.debet) || 0;
    var payableAccoount = await Account.findOne({ accTitel: "Payable" });
    if(!payableAccoount){
      payableAccoount = new Account({
        accTitel: "Payable",
        accDesscri: "Default",
        transaction: [],
      });
    }
    payableAccoount.transaction = payableAccoount.transaction.concat({
      walletName: id,
      type: "Payable",
      amount: totalAmount,
      description: "New Product Added",
      debit: 0,
      credit: totalAmount,
      balance: parseInt(payTotal) + parseInt(totalAmount),
      date: Date.now(),
    });
    await payableAccoount.save();

    req.flash("success", `${Name}  added success fully !!!!!`);
    return res.redirect("/product/list");
  } catch (error) {
    console.log(error);
  }
});

// update Product get router
router.get("/update/:id", isAuth, async (req, res) => {
  try {
      const userdata = await User.findOne({ _id: req.user.id });
      const brand = await Brand.find({});
      const unit = await Unit.find({});
      const category = await Category.find({});
      const supp = await Supplier.find({});
      const product = await Product.findOne({ _id: req.params.id });
      console.log(product);
      
      const  footer =await Shop.findOne({})
     res.render("updateProduct", {
        success: req.flash("success"),
        errors: req.flash("errors"),
        userdata: userdata,
        pro: product,
        brand: brand,
        unit: unit,
        category: category,
        supp: supp,
        footer,
      });
  } catch (error) {
    console.log(error);
  }
});

//update Product post router
router.post("/updateproduct/:id", isAuth, upload.single("proimg"), async (req, res) => {
  try {
    const {
      Name,
      proCode,
      brand,
      quantity,
      unitType,
      unitValue,
      category,
      SubCategory,
      sellingPrice,
      purchasePrice,
      discountType,
      discount,
      tax,
      supplier,
    } = req.body;

    const missingF = Object.entries(req.body)
      .filter(([key, val]) => val.trim() === "")
      .map(([key]) => key);
    
    if (missingF.length > 0) {
      req.flash("errors", `Missing fields: ${missingF.join(", ")}`);
      return res.redirect("back");
    }

    const proname = await Product.findOne({
      Name: Name,
      _id: { $ne: req.params.id },
    });
    if (proname) {
      req.flash("errors", `${Name} already added, please choose another`);
      return res.redirect("/product/list");
    }

    const pcode = await Product.findOne({
      proCode: proCode,
      _id: { $ne: req.params.id },
    });
    if (pcode) {
      req.flash("errors", `Product Code already exists: ${proCode}`);
      return res.redirect("/product/list");
    }

    const pro = await Product.findById(req.params.id);

    const oldQuantity = parseInt(pro.quantity);
    const oldPurchasePrice = parseInt(pro.purchasePrice);
    const oldTotal = oldQuantity * oldPurchasePrice;
    const newQuantity = parseInt(quantity);
    const newPurchasePrice = parseInt(purchasePrice);
    const newTotal = newQuantity * newPurchasePrice;

    // Update product fields
    pro.Name = Name;
    pro.proCode = proCode;
    pro.brand = brand;
    pro.quantity = quantity;
    pro.unitType = unitType;
    pro.unitValue = unitValue;
    pro.category = category;
    pro.SubCategory = SubCategory;
    pro.sellingPrice = sellingPrice;
    pro.purchasePrice = purchasePrice;
    pro.discountType = discountType;
    pro.discount = discount;
    pro.tax = tax;
    pro.supplier = supplier;

    if (req.file) {
       if (pro?.productImage) {
                const oldImagePath = path.join(__dirname, '../public/uploads/resized/', pro.productImage);
                  
                try {
                  if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath); 
                  }
                } catch (err) {
                  console.error("Error deleting old image:", err);
                }
              }
      const { filename: image } = req.file;
      await sharp(req.file.path)
        .resize(200, 200)
        .jpeg({ quality: 90 })
        .toFile(path.resolve(req.file.destination, "resized", image));

      fs.unlinkSync(req.file.path);
      pro.productImage = req.file.filename;
    }

    await pro.save();

    //  Check if quantity or purchasePrice changed
    if (oldTotal !== newTotal) {
      const supplierData = await Supplier.findOne({ suppName: supplier });

      // Order history update
      supplierData.orderList = supplierData.orderList.concat({
        productName: Name,
        productQuntity: newQuantity,
        productPrice: newPurchasePrice,
        totalAmount: newTotal,
        date: Date.now(),
      });

      await supplierData.save();

      // Account Payable update
      const account = await Account.aggregate([
        { $match: { accTitel: { $eq: "Payable" } } },
        {
          $project: {
            debet: { $sum: "$transaction.debit" },
            credit: { $sum: "$transaction.credit" },
          },
        },
      ]);

      let payTotal = (parseInt(account[0]?.credit) || 0) - (parseInt(account[0]?.debet) || 0);

      let payableAccount = await Account.findOne({ accTitel: "Payable" });
      if (!payableAccount) {
        payableAccount = new Account({
          accTitel: "Payable",
          accDesscri: "Default",
          transaction: [],
        });
      }

      // Subtract old, add new amount
      let amountDiff = newTotal - oldTotal;

      payableAccount.transaction = payableAccount.transaction.concat({
        walletName: supplierData._id,
        type: "Payable",
        amount: amountDiff,
        description: "Product updated",
        debit: amountDiff < 0 ? Math.abs(amountDiff) : 0,
        credit: amountDiff > 0 ? amountDiff : 0,
        balance: payTotal + amountDiff,
        date: Date.now(),
      });

      await payableAccount.save();
    }

    req.flash("success", `${Name} updated successfully`);
    res.redirect("/product/list");

  } catch (error) {
    console.log(error);
    req.flash("errors", "Something went wrong while updating product.");
    res.redirect("back");
  }
});


// Product List router
router.get("/list", isAuth, async (req, res) => {
  try {
    const userdata = await User.findOne({ _id: req.user.id });
    const footer = await Shop.findOne({})
    const productSpliyer = await Product.aggregate([
      {
        $lookup: {
          from: "orders",
          let: { serch: "$Name" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$$serch", "$item.productName"],
                },
              },
            },
            { $unwind: "$item" },
            {
              $match: {
                $expr: {
                  $eq: ["$item.productName", "$$serch"],
                },
              },
            },
            {
              $group: {
                _id: "$item.productName",
                totalOrder: { $sum: "$item.productCount" },
              },
            },
          ],
          as: "order",
        },
      },
      {
        $unwind: {
          path: "$order",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          order: { $ifNull: ["$order.totalOrder", 0] }, 
        },
      },
      {
        $project: {
          Name: 1,
          proCode: 1,
          brand: 1,
          quantity: 1,
          unitType: 1,
          unitValue: 1,
          category: 1,
          purchasePrice: 1,
          sellingPrice: 1,
          productImage: 1,
          supplier: 1,
          order: 1,
        },
      },
    ]);
    
    res.render("productList", {
      success: req.flash("success"),
      errors: req.flash("errors"),
      userdata: userdata,
      data: productSpliyer,
      footer,
    });
  } catch (error) {
    console.log(error);
  }
});

//delet Product
router.get("/delet/:id", isAuth, async (req, res) => {
  try {
    const pro = await Product.findById(req.params.id);

    if (pro?.productImage) {
      const oldImagePath = path.join(__dirname, '../public/uploads/resized/', pro.productImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const del = await Product.findByIdAndDelete(req.params.id);

   
    const totalAmountToRemove = parseInt(del.purchasePrice) * parseInt(del.quantity);

 t
    const supplier = await Supplier.findOne({ suppName: del.supplier });
    if (supplier) {
      supplier.productList = supplier.productList.filter(p => p.productName !== del.Name);

     
      supplier.orderList = supplier.orderList.filter(order => order.productName !== del.Name);

      await supplier.save();
    }

 
    const payableAccount = await Account.findOne({ accTitel: "Payable" });

    if (payableAccount) {
      const lastTransaction = payableAccount.transaction.at(-1);
      const prevBalance = lastTransaction ? lastTransaction.balance : 0;

      payableAccount.transaction = payableAccount.transaction.concat({
        walletName: supplier?._id || null,
        type: "Payable",
        amount: totalAmountToRemove,
        description: `Product Deleted: ${del.Name}`,
        debit: totalAmountToRemove,
        credit: 0,
        balance: parseInt(prevBalance) - totalAmountToRemove,
        date: Date.now()
      });

      await payableAccount.save();
    }

    req.flash("success", `${del.Name} Deleted successfully and payable amount updated.`);
    res.redirect("/product/list");

  } catch (error) {
    console.log("Delete Error:", error);
    req.flash("errors", "Something went wrong while deleting product.");
    res.redirect("/product/list");
  }
});


//bulkimport get
router.get("/bulkimport", isAuth, async (req, res) => {
  const userdata = await User.findOne({ _id: req.user.id });
  const footer = await Shop.findOne({})

  res.render("bulkImport", {
    success: req.flash("success"),
    errors: req.flash("errors"),
    userdata: userdata,
    footer,
  });
});

//download Demo formate
router.get("/download_formet", isAuth, (req, res) => {
  res.download("public/images/data.csv");
});

//post upload csv product
router.post(
  "/uploadcsv",
  uploadcsv.single("impCSV"),
  async function (req, res) {
    var pathf = req.file.path;
   

    const rows = [];
    var filename = path.join(__dirname, "../public/uploads/product.csv");
    const fs = require("fs");
    if (fs.existsSync(filename)) {
      
      fs.createReadStream(filename)
        .pipe(parse({ headers: true }))
        .on("error", (error) => console.error(error))
        .on("data", async (row) => {
          //each row can be written to db
          var Name = row.name;
          var proCode = row.product_code;
          var brand = row.brand;
          var quantity = row.quantity;
          var unitType = row.unit_type;
          var unitValue = row.unit_value;
          var category = row.category_Name;
          var SubCategory = row.sub_category_Name;
          var sellingPrice = row.selling_price;
          var purchasePrice = row.purchase_price;
          var discountType = row.discount_type;
          var discount = row.discount;
          var tax = row.tax;
          var supplier = row.supplier_Name;

          var porduc = await Product.create({
            Name,
            proCode,
            brand,
            quantity,
            unitType,
            unitValue,
            category,
            SubCategory,
            sellingPrice,
            purchasePrice,
            discountType,
            discount,
            tax,
            supplier,
          });
          rows.push(row);
        })
        .on("end", (rowCount) => {
          setTimeout(() => {
            fs.unlinkSync(pathf);
          }, "3000");
        });
    } else {
      console.error("File does not exist");
    }

    res.redirect("back");
  }
);

//**************download exle file************ */

router.get("/export-Bulk", async (req, res) => {
  try {
    const data = await Product.find({});

    let workbook = new Excel.Workbook();
    let worksheet = workbook.addWorksheet("orderList");

    worksheet.columns = [
      { header: "name", key: "Name", width: 35 },
      { header: "product_code", key: "proCode", width: 35 },
      { header: "unit_type", key: "unitType", width: 20 },
      { header: "unit_value", key: "unitValue", width: 20 },
      { header: "brand", key: "brand", width: 20 },
      { header: "category_Name", key: "category", width: 20 },
      { header: "sub_category_Name", key: "SubCategory", width: 20 },
      { header: "purchase_price", key: "purchasePrice", width: 20 },
      { header: "selling_price", key: "sellingPrice", width: 20 },
      { header: "discount_type", key: "discountType", width: 20 },
      { header: "discount", key: "discount", width: 20 },
      { header: "tax", key: "tax", width: 20 },
      { header: "quantity", key: "quantity", width: 20 },
      { header: "supplier_Name", key: "supplier", width: 20 },
    ];

    data.forEach(function (row) {
      worksheet.addRow(row);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "orderList.xlsx"
    );
    return workbook.xlsx.write(res).then(function () {
      res.status(200).end;
    });
  } catch (error) {
    console.log(error);
  }
});

//limited product list
router.get("/limited", isAuth, async (req, res) => {
  try {
    const userdata = await User.findOne({ _id: req.user.id });
    const footer = await Shop.findOne({});

    const limit = 50;
   console.log(limit);
   
    const proList = await Product.find({ quantity: { $lte: limit } });
    console.log(proList);
 
    res.render("limitProduct", {
      success: req.flash("success"),
      errors: req.flash("errors"),
      userdata,
      data: proList,
      footer,
    });
  } catch (error) {
    console.log(error);
    res.redirect("back");
  }
});

router.get("/limitedAjax", isAuth, async (req, res) => {
  try {
    const userdata = await User.findOne({ _id: req.user.id });
    const footer = await Shop.findOne({});

    const limit = parseInt(req.query.limit) || 50;

   
    const proList = await Product.find({ quantity: { $lte: limit } });

 
    res.json({
      success: req.flash("success"),
      errors: req.flash("errors"),
      userdata,
      data: proList,
      footer,
    });
  } catch (error) {
    console.log(error);
    res.redirect("back");
  }
});


router.post("/subcat", async (req, res) => {
  const data = await Category.findOne({ catName: req.body.cat_id });
  res.status(201).json(data);
});

// product Quntity increase by + butten
router.post("/quantity/:id", isAuth, async (req, res) => {
  try {
    const userdata = await User.findById(req.user.id);


    const userRoleName = userdata.role;
    const userRole = await UserRole.findOne({ titel: userRoleName });

    const hasPermission =
      userRole?.limit_product_list?.includes("add") || userRoleName === "admin";

    if (!hasPermission) {
      req.flash("errors", "You do not have permission to update product quantity.");
      return res.redirect("back");
    }

    const quantity = parseInt(req.body.quantity);
    const date = new Date(req.body.date);

    const product = await Product.findById(req.params.id);
    if (!product) {
      req.flash("errors", "Product not found.");
      return res.redirect("back");
    }

    product.quantity += quantity;
    await product.save();

    const totalAmount = product.purchasePrice * quantity;

    const supplier = await Supplier.findOne({ suppName: product.supplier });
    if (!supplier) {
      req.flash("errors", "Supplier not found.");
      return res.redirect("back");
    }

    supplier.orderList.push({
      productName: product.Name,
      productQuntity: quantity,
      productPrice: product.purchasePrice,
      totalAmount: totalAmount,
      date: date,
    });
    await supplier.save();

    const payableAccountDetail = await Account.aggregate([
      { $match: { accTitel: "Payable" } },
      {
        $project: {
          debit: { $sum: "$transaction.debit" },
          credit: { $sum: "$transaction.credit" },
        },
      },
    ]);

    const currentBalance =
      (payableAccountDetail[0]?.credit || 0) -
      (payableAccountDetail[0]?.debit || 0);

    const payableAccount = await Account.findOne({ accTitel: "Payable" });

    payableAccount.transaction.push({
      walletName: supplier._id,
      type: "Payable",
      amount: totalAmount,
      description: "New Product Purchase",
      debit: 0,
      credit: totalAmount,
      balance: currentBalance + totalAmount,
      date: date,
    });

    await payableAccount.save();
    req.flash("success", "Quantity successfully add");
    res.redirect("back");
  } catch (error) {
    console.error("Error updating product quantity:", error);
    req.flash("errors", "Something went wrong.");
    res.redirect("back");
  }
});


// print data get router
router.get("/printdata/:id", isAuth, async (req, res) => {
  try {
    const userdata = await User.findOne({ _id: req.user.id });
    const footer = await Shop.findOne({})

    const product = await Product.findById(req.params.id);

    res.render("printProduct", {
      success: req.flash("success"),
      errors: req.flash("errors"),
      userdata: userdata,
      pro: product,
      footer,
    });
  } catch (error) {
    console.log(error);
  }
});

// make thermal printer barcode data
router.post("/barcode/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
