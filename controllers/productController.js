const Product = require('../models/productModel')
const Category = require('../models/categoryModel')

// ---- /products -------------------------------

const products = async (req, res) => {
    try {
        res.render('productList', { title: 'Products', header: true, sidebar: true, footer: true })
    } catch (error) {
        console.log(error.message)
    }
}


// ---- /newProducts ----------------------------

const newProduct = async (req, res) => {
    try {

        const categoryData = await Category.find({},{name:1})
        console.log(categoryData)

        res.render('newProduct', { title: "Add product", header: false, sidebar: false, footer: false,categoryData })
    } catch (error) {
        console.log(error.message)
    }
}

const addProduct = async (req,res) =>{
    try {
        console.log("clicked")
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    products,
    newProduct,
    addProduct
}