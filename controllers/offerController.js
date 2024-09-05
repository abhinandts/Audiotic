const Products = require('../models/productModel')
const Categories = require('../models/categoryModel')

const loadOffers = async (req, res) => {
    try {
        const products = await Products.find();
        const categories = await Categories.find({ is_active: true }, { name: 1 })

        const categoryWithCount = await Promise.all(
            categories.map(async (category) => {
                const count = await Products.countDocuments({ category: category._id })

                return { ...category._doc, count }
            })
        )
        res.render('offersPage', {
            title: 'Offers Page', products, categoryWithCount, header: true, sidebar: true, footer: true
        })
    } catch (error) {
        console.error(error)
    }
}

// const applyProductOffer = async (req, res) => {
//     try {

//         const { productIds, discount } = req.body;

//         if (!Array.isArray(productIds) || productIds.length === 0 || !discount) {
//             return res.status(400).json({ message: "Invalid input. Please provide product IDs and discount." });
//         }

//         const products = await Products.find({ _id: { $in: productIds } });

//         if (productIds.length === 0) {
//             return res.status(404).json({ message: 'No products found' })
//         }

//         const updatePromises = products.map(product => {
//             const discountedPrice = Math.round(product.price * (100 - discount) / 100);
//             return Products.updateOne(
//                 { _id: product._id }, {
//                 $set: { discount: discount, price: discountedPrice }
//             }
//             );
//         });

//         const updateResults = await Promise.all(updatePromises);
//         const modifiedCount = updateResults.reduce((acc, result) => acc + result.modifiedCount, 0);

//         if (modifiedCount === 0) {
//             return res.status(404).json({ message: "No products found" })
//         }

//         res.status(200).json({
//             message: `Offers applied to ${modifiedCount} products`,
//             modifiedCount: modifiedCount
//         });

//     } catch (error) {
//         console.error(error)
//         res.status(500)
//     }
// }

// const applyCategoryOffer = async (req, res) => {
//     try {
//         const { id, offer } = req.body

//         const products = await Products.find({ category: id }, { _id: 1, price: 1, discount: 1 })

//         const updatePromises = products.map((product) => {
//             const discountedPrice = Math.round(product.price * (100 - offer) / 100);
//             return Products.updateOne(
//                 { _id: product._id },
//                 { $set: { discount: offer, price: discountedPrice } }
//             );
//         })

//         const updateResults = await Promise.all(updatePromises);
//         const modifiedCount = updateResults.reduce((acc,result)=>acc+result.modifiedCount,0);

//         if(modifiedCount ===0){
//             return res.status(404).json({message:"No products found"})
//         }

//         res.status(200).json({
//             message: `Offers applied to ${modifiedCount} products`,
//             modifiedCount: modifiedCount
//         });


//     } catch (error) {
//         console.error(error)
//         res.status(500)
//     }
// }


const updateProductDiscounts = async (products, discount) => {
    console.log(products, discount);
    
    const updatePromises = products
        .filter(product => product.discount < discount)  // Filter products where discount is less than the new one
        .map(product => {
            const discountedPrice = Math.round(product.mrp * (100 - discount) / 100);
            return Products.updateOne(
                { _id: product._id },
                { $set: { discount: discount, price: discountedPrice } }
            );
        });

    if (updatePromises.length === 0) {
        return 0; // If no products are updated
    }

    const updateResults = await Promise.all(updatePromises);
    return updateResults.reduce((acc, result) => acc + result.modifiedCount, 0);
};

// Apply discount to specific products
const applyProductOffer = async (req, res) => {
    try {
        const { productIds, discount } = req.body;

        if (!Array.isArray(productIds) || productIds.length === 0 || !discount) {
            return res.status(400).json({ message: "Invalid input. Please provide product IDs and discount." });
        }

        const products = await Products.find(
            { _id: { $in: productIds } },
            { name: 1, price: 1, mrp: 1, discount: 1 }
        );
        if (products.length === 0) {
            return res.status(404).json({ message: 'No products found' });
        }

        const modifiedCount = await updateProductDiscounts(products, discount);

        // if (modifiedCount === 0) {
        //     return res.status(404).json({ message: "No products updated." });
        // }
        if (modifiedCount === 0) {
            return res.status(200).json({
                message: "No products were eligible for the new discount.",
                modifiedCount
            });
        }

        res.status(200).json({
            message: `Offers applied to ${modifiedCount} products`,
            modifiedCount
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Apply discount to all products in a category
const applyCategoryOffer = async (req, res) => {
    try {
        const { id, discount } = req.body;

        const products = await Products.find(
            { category: id },
            { name: 1, mrp: 1, price: 1, discount: 1 }
        );
        if (products.length === 0) {
            return res.status(404).json({ message: 'No products found' });
        }

        const modifiedCount = await updateProductDiscounts(products, discount);

        // if (modifiedCount === 0) {
        //     return res.status(404).json({ message: "No products updated." });
        // }
        if (modifiedCount === 0) {
            return res.status(200).json({
                message: "No products were eligible for the new discount.",
                modifiedCount
            });
        }

        res.status(200).json({
            message: `Offers applied to ${modifiedCount} products`,
            modifiedCount
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = {
    loadOffers,
    applyProductOffer,
    applyCategoryOffer
}