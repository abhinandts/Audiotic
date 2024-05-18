const Product = require('../models/productModel')
const Category = require('../models/categoryModel')

// ---- /products -------------------------------

const loadProducts = async (req, res) => {
    try {
        const productData = await Product.find()
        res.render('productList', { title: 'Products', header: true, sidebar: true, footer: true, productData })
    } catch (error) {
        console.log(error.message)
    }
}


// ---- /newProduct ----------------------------

const newProduct = async (req, res) => {
    try {
        const categoryData = await Category.find({}, { name: 1 })

        res.render('newProduct', { title: "Add product", header: false, sidebar: false, footer: false, categoryData })

    } catch (error) {
        console.log(error.message)
    }
}

const addProduct = async (req, res) => {
    try {

        const { productName, productSpecifications, mrp, price } = req.body
        console.log(productName, price)
        const categories = await Category.find()

        const imageNames = req.files.map(file => file.filename)

        const product = new Product({
            productName,
            productSpecifications,
            category: req.body.category,
            mrp,
            price,
            image: imageNames
        })

        await product.save()

        res.redirect('/admin/products')

    } catch (error) {
        console.log(error.message)
    }
}

//---- /blockProduct ----------------------------------

const blockProduct = async (req, res) => {
    try {
        const id = req.params.productId
        const product = await Product.findById(id)

        if (product.is_active) {
            product.is_active = false
            await product.save()
        } else {
            product.is_active = true
            await product.save()
        }
        res.redirect('/admin/products')
    } catch (error) {
        console.log(error.message)
    }
}

//---- editProduct -----------------------------------

const editProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId)
        const categories = await Category.find({}, { name: 1 })

        res.render('editProduct', { title: "Edit Product", header: true, sidebar: true, footer: true, product, categories })

    } catch (error) {
        console.log(error.message)
    }
}

const updateProduct = async (req, res) => {
    try {

        const { productName, productSpecifications, mrp, price, category } = req.body;
        await Product.findByIdAndUpdate(req.params.productId, { productName, productSpecifications, mrp, price, category })

        res.redirect('/admin/products')

    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadProducts,
    newProduct,
    addProduct,
    blockProduct,
    editProduct,
    updateProduct
}