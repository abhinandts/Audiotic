const Product = require('../models/productModel')
const Category = require('../models/categoryModel');
const adminRoute = require('../routes/adminRoute');

const fs = require('fs');
const path = require('path');

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

        const productExists = await Product.findOne({ productName })

        if (productExists) {

            // const categoryData = await Category.find({ is_active: true }, { name: 1 });

            return res.render('newProduct', {
                error: "Product name already exist", title: "Add Product", header: false, footer: false, sidebar: false,
                categoryData: await Category.find({ is_active: true }, { name: 1 }),
                productName,
                productSpecifications,
                mrp,
                price,
                discount,
                stock,
                category
            })
        }
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
        const product = await Product.findById(req.params.productId)
        const categories = await Category.find({}, { name: 1 })

        res.render('editProduct', { title: "Edit Product", header: false, sidebar: false, footer: true, product, categories })
    } catch (error) {
        console.log(error.message)
    }
}

const updateProduct = async (req, res) => {
    try {
        const { productName, productSpecifications, mrp, discount, price, stock, category } = req.body;
        const catId = await Category.findOne({ name: category })
        console.log(catId)
        await Product.findByIdAndUpdate(req.params.productId, { productName, productSpecifications, mrp, discount, price, stock, category: catId })

        res.redirect('/admin/products')
    } catch (error) {
        console.log(error.message)
    }
}


// ---- deleteImage

const deleteImage = async (req, res) => {
    try {
        const { imageName, productId } = req.params;

        // Assuming `image` is the array field in your Product schema
        const deleteImage = await Product.findByIdAndUpdate(
            productId,
            { $pull: { image: imageName } }
        );

        if (deleteImage) {
            console.log(`Product ID: ${productId}`);


            // Redirecting to the correct URL
            res.redirect(`/admin/editProduct/${productId}`);
        } else {
            console.log("Error occurred: Image deletion failed");
            res.status(500).send("Image deletion failed");
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("An error occurred while deleting the image");
    }
};



// const deleteImage = async (req, res) => {
//     try {
//         const { imageName, productId } = req.params;

//         // Validate productId
//         if (!mongoose.Types.ObjectId.isValid(productId)) {
//             return res.status(400).send('Invalid product ID');
//         }

//         // Convert productId to ObjectId
//         const objectId = mongoose.Types.ObjectId(productId);

//         // Update product to remove image reference
//         const updateResult = await Product.findByIdAndUpdate(objectId, { $pull: { image: imageName } });

//         if (updateResult) {
//             console.log(`Product ID: ${productId}, Image Name: ${imageName} removed`);

//             // Delete the image file from the file system if needed
//             const imagePath = path.join(__dirname, '../public/admin/productImages', imageName);
//             if (fs.existsSync(imagePath)) {
//                 fs.unlinkSync(imagePath);
//             } else {
//                 console.log('Image file not found:', imagePath);
//             }

//             res.redirect(`/admin/editProduct/<%- productId %> `);
//         } else {
//             console.log("Error occurred: Product not found or image not removed");
//             res.status(500).send('An error occurred while deleting the image.');
//         }
//     } catch (error) {
//         console.log('Error:', error.message);
//         res.status(500).send('An error occurred while deleting the image.');
//     }
// };









// ---- replaceImage

const replaceImage = async (req, res) => {
    try {
        console.log("replace Image")
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
    updateProduct,
    replaceImage,
    deleteImage,
}