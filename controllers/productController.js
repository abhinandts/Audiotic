const Product = require('../models/productModel')
const Category = require('../models/categoryModel');
const adminRoute = require('../routes/adminRoute');

const fs = require('fs');
const path = require('path');
const { checkName } = require('./couponController');

// ---- /products -------------------------------

const loadProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page - 1) * limit;

        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit)

        const productData = await Product.find().populate('category', 'name').sort({ _id: -1 }).skip(skip).limit(limit);
        res.render('productList', { title: 'Products', header: true, sidebar: true, footer: true, productData, currentPage: page, totalPages: totalPages })

    } catch (error) {
        console.log(error.message)
    }
}


// ---- /newProduct ----------------------------

const newProduct = async (req, res) => {
    try {
        const categoryData = await Category.find({ is_active: true }, { name: 1 })

        res.render('newProduct', {
            error: req.query.error || false,
            title: "Add product", header: false, sidebar: false, footer: false,
            categoryData,
            productName: req.query.productName || '',
            productSpecifications: req.query.productSpecifications || '',
            mrp: req.query.mrp || '',
            price: req.query.price || '',
            discount: req.query.discount || '',
            stock: req.query.stock || '',
            category: req.query.category || ''
        })
    } catch (error) {
        console.log(error.message)
    }
}

const addProduct = async (req, res) => {
    try {
        const { category, productName, productSpecifications, mrp, price, discount, stock } = req.body
        const cate = await Category.findOne({ name: category })
        const imageNames = req.files.map(file => file.filename)

        const product = new Product({
            productName,
            productSpecifications,
            category: cate._id,
            mrp,
            price,
            discount,
            stock,
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
        const product = await Product.findById(req.params.productId).populate({path:'category', select:'name'})
        const categories = await Category.find({}, { name: 1 })

        res.render('editProduct', { title: "Edit Product", header: false, sidebar: false, footer: true, product, categories })
    } catch (error) {
        console.log(error.message)
    }
}


const updateProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await Product.findById(productId);

        // Handle new image uploads
        const newImages = req.files ? req.files.map(file => file.filename) : [];

        // Handle image deletion
        let deleteImages = req.body.deleteImages || []; // Images marked for deletion

        // Convert to an array if it's a single string
        if (!Array.isArray(deleteImages)) {
            deleteImages = [deleteImages];
        }

        // Remove the deleted images from the server and MongoDB
        deleteImages.forEach(img => {
            const imagePath = path.join(__dirname, '../public/admin/productImages', img);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath); // Delete image from server
            }
        });

        // Filter out the deleted images from the product's image array in MongoDB
        product.image = product.image.filter(img => !deleteImages.includes(img));

        // 3. Add the newly uploaded images to the product's image array in MongoDB
        product.image = product.image.concat(newImages);

        // Update other product fields
        product.productName = req.body.productName;
        product.productSpecifications = req.body.productSpecifications;
        product.mrp = req.body.mrp;
        product.price = req.body.price;
        product.stock = req.body.stock;
        product.discount = req.body.discount;
        product.category = req.body.category;

        // Save the updated product
        await product.save();

        // Redirect to the products page
        res.redirect('/admin/products');
    } catch (error) {
        console.log(error.message);
    }
};


const checkProductName = async (req, res) => {
    try {
        const name = req.query.name

        const sameName = await Product.findOne({ productName: name })

        if (sameName) {
            res.status(409).json({ message: "Product name already exists" })
        } else {
            res.status(200).json({ message: "Product name available" })
        }

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error." })
    }
}

module.exports = {
    loadProducts,
    newProduct,
    addProduct,
    blockProduct,
    editProduct,
    updateProduct,
    checkProductName
}