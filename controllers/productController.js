const Product = require('../models/productModel')
const Category = require('../models/categoryModel');
const fs = require('fs');
const path = require('path');

// ---- /products -------------------------------

const loadProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        const skip = (page - 1) * limit;

        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit)

        const productData = await Product.find({}, {
            name: 1,
            price: 1,
            stock: 1,
            is_active:1,
            image: { $slice: 1 }
        })
            .populate('category', 'name')
            .sort({ _id: -1 })
            .skip(skip).limit(limit);
            
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
        const { category, name, description, price, offer, stock } = req.body
        const cate = await Category.findOne({ name: category })
        const imageNames = req.files.map(file => file.filename)

        const product = new Product({
            name,
            description,
            category: cate._id,
            price,
            offer,
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
        const product = await Product.findById(req.params.productId).populate({ path: 'category', select: 'name' })
        const categories = await Category.find({ is_active: true }, { name: 1 })

        res.render('editProduct', { title: "Edit Product", header: false, sidebar: false, footer: true, product, categories })
    } catch (error) {
        console.log(error.message)
    }
}

const updateProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await Product.findById(productId);

        const newImages = req.files ? req.files.map(file => file.filename) : [];

        let deleteImages = req.body.deleteImages || [];

        if (!Array.isArray(deleteImages)) {
            deleteImages = [deleteImages];
        }

        deleteImages.forEach(img => {
            const imagePath = path.join(__dirname, '../public/admin/productImages', img);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        });

        product.image = product.image.filter(img => !deleteImages.includes(img));

        product.image = product.image.concat(newImages);

        product.name = req.body.name;
        product.description = req.body.description;
        product.price = req.body.price;
        product.stock = req.body.stock;
        product.offer = req.body['product-offer'];
        product.category = req.body.category;

        await product.save();

        res.redirect('/admin/products');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
};


const checkProductName = async (req, res) => {
    const { name, currentId } = req.body;
    try {
        const sameName = await Product.findOne({
            name: new RegExp(`^${name}$`, 'i'),
            _id: { $ne: currentId }
        });

        if (sameName) {
            res.status(409).json({ exists: true, message: "Product name already exists." });
        } else {
            res.status(200).json({ exists: false, message: "Product name available" });
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