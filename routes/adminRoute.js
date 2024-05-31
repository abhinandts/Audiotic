const express = require('express')
const ejsLayouts = require('express-ejs-layouts')

const path = require('node:path')
// ------------------------------------------------------------

const multer = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        
      cb(null, path.join(__dirname,'../public/admin/productImages'))
    },
    
    filename: function (req, file, cb) {
        
      const name =file.originalname
      cb(null, name)
    }
  })
  
  const upload = multer({ storage: storage})

// ------------------------------------------------------------

const adminRoute = express()

adminRoute.use(ejsLayouts)
adminRoute.set('layout','../admin/layouts/fullwidth')

adminRoute.use(express.static('public'))

adminRoute.use('/css', express.static(__dirname + '/public/admin/css'))
adminRoute.use('/fonts', express.static(__dirname + '/public/admin/fonts'))
adminRoute.use('/imgs', express.static(__dirname + '/public/admin/imgs'))
adminRoute.use('/js', express.static(__dirname + '/public/admin/js'))
adminRoute.use('/sass', express.static(__dirname + '/public/admin/sass'))

adminRoute.set('views', './views/admin')

const bodyParser = require('body-parser')
adminRoute.use(bodyParser.json())
adminRoute.use(bodyParser.urlencoded({ extended: true }))

// ---- controllers --------------------------------
const adminController = require('../controllers/adminController')
const categoryController = require('../controllers/categoryController')
const productController = require('../controllers/productController')
// ----------------------------------------

adminRoute.get("/login", adminController.loadLogin)
adminRoute.post("/login", adminController.verifyLogin)

adminRoute.get("/dashboard", adminController.loadDashboard)

adminRoute.get("/users",adminController.loadUsers)

adminRoute.get("/blockUser/:userId",adminController.blockUser)
adminRoute.get("/unblockUser/:userId",adminController.unblockUser)

// ---- category ----

adminRoute.get("/category",categoryController.loadCategory)

adminRoute.post("/addCategory",categoryController.addCategory)

adminRoute.get("/disable/:categoryId",categoryController.disableCategory)

adminRoute.get("/editCategory/:categoryId",categoryController.editCategory)
adminRoute.post("/editCategory",categoryController.saveCategory)

// ---- product ----

adminRoute.get("/products",productController.loadProducts)

adminRoute.get("/newProduct",productController.newProduct)
adminRoute.post("/newProduct",upload.array('image',5),productController.addProduct)

adminRoute.get("/blockProduct/:productId",productController.blockProduct)

adminRoute.get("/editProduct/:productId",productController.editProduct)
adminRoute.post("/editProduct/:productId",productController.updateProduct)

adminRoute.get("*", (req, res) => {
    res.redirect('/admin')
})

module.exports = adminRoute