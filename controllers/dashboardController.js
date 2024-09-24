const Orders = require('../models/ordersModel')
const Products = require('../models/productModel')
const Categories = require('../models/categoryModel')
const Users = require('../models/userModel')


const loadDashboard = async (req, res) => {
    try {
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        // Combine multiple aggregations into one call
        const orderStats = await Orders.aggregate([
            {
                $facet: {
                    totalRevenue: [
                        { $match: { orderStatus: "Delivered" } },
                        { $group: { _id: null, totalRevenue: { $sum: "$orderTotal" } } }
                    ],
                    totalOrders: [
                        { $match: { orderStatus: { $in: ["Delivered", "Cancelled", "Returned"] } } },
                        { $count: "totalOrders" }
                    ],
                    totalMonthRevenue: [
                        { 
                            $match: { 
                                orderStatus: "Delivered",
                                createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
                            } 
                        },
                        { $group: { _id: null, totalRevenue: { $sum: "$orderTotal" } } }
                    ]
                }
            }
        ]);
        const topSellingProducts = await Orders.aggregate([
            {
                $match: {
                    orderStatus: "Delivered"  // Only count delivered orders
                }
            },
            {
                $unwind: "$products"  // Unwind the products array
            },
            {
                $group: {
                    _id: "$products.product",  // Group by product ID
                    totalSold: { $sum: "$products.quantity" }  // Sum up the quantity sold for each product
                }
            },
            {
                $lookup: {  // Join with the Product collection to get product details
                    from: "products",  // The Product collection name
                    localField: "_id",  // The product ID from Orders
                    foreignField: "_id",  // The product ID in the Product collection
                    as: "productDetails"
                }
            },
            {
                $unwind: "$productDetails"  // Unwind the product details array
            },
            {
                $lookup: {  // Join with the Category collection to get category details
                    from: "categories",  // The Category collection name
                    localField: "productDetails.category",  // Join using the category field in productDetails
                    foreignField: "_id",  // The category ID in the Category collection
                    as: "categoryDetails"
                }
            },
            {
                $unwind: "$categoryDetails"  // Unwind the category details array
            },
            {
                $project: {
                    productId: "$_id",
                    productName: "$productDetails.productName",  // Include product name
                    categoryName: "$categoryDetails.name",  // Include category name
                    totalSold: 1,  // Keep totalSold field
                    productImages: "$productDetails.image"  // Include the array of product images
                }
            },
            {
                $sort: { totalSold: -1 }  // Sort by totalSold in descending order
            },
            {
                $limit: 10  // Limit the result to top 10
            }
        ]);

        const topSellingCategories = await Orders.aggregate([
            {
                $match: {
                    orderStatus: "Delivered"  // Only count delivered orders
                }
            },
            {
                $unwind: "$products"  // Unwind the products array
            },
            {
                $lookup: {  // Join with the Product collection to get product details
                    from: "products",  // The Product collection name
                    localField: "products.product",  // Join using the product ID
                    foreignField: "_id",  // The product ID in the Product collection
                    as: "productDetails"
                }
            },
            {
                $unwind: "$productDetails"  // Unwind the product details array
            },
            {
                $lookup: {  // Join with the Category collection to get category details
                    from: "categories",  // The Category collection name
                    localField: "productDetails.category",  // Join using the category field in productDetails
                    foreignField: "_id",  // The category ID in the Category collection
                    as: "categoryDetails"
                }
            },
            {
                $unwind: "$categoryDetails"  // Unwind the category details array
            },
            {
                $group: {
                    _id: "$categoryDetails._id",  // Group by category ID
                    categoryName: { $first: "$categoryDetails.name" },  // Get the category name
                    totalSold: { $sum: "$products.quantity" },  // Sum the quantity sold for each category
                    totalProducts: { $sum: 1 }  // Count the total number of products sold in each category
                }
            },
            {
                $sort: { totalSold: -1 }  // Sort by totalSold in descending order
            },
            {
                $limit: 3  // Limit the result to top 3 categories
            }
        ]);
        
        console.log(topSellingCategories);
        
        






        

        // Separate the data from the aggregation result
        const totalRevenue = orderStats[0].totalRevenue.length > 0 ? orderStats[0].totalRevenue[0].totalRevenue : 0;
        const totalOrders = orderStats[0].totalOrders.length > 0 ? orderStats[0].totalOrders[0].totalOrders : 0;
        const totalMonthRevenue = orderStats[0].totalMonthRevenue.length > 0 ? orderStats[0].totalMonthRevenue[0].totalRevenue : 0;

        // Fetch total products count in a separate query
        const totalProducts = await Products.countDocuments();
        const totalCategories = await Categories.countDocuments();

        const latestUsers = await Users.find({},{name:1,email:1}).sort({_id:-1}).limit(3)

  

        // Render the dashboard view with fetched data
        res.render('dashboard', {
            totalRevenue,
            totalOrders,
            totalMonthRevenue,
            totalProducts,
            totalCategories,
            latestUsers,
            topSellingProducts,
            topSellingCategories,
            title: 'Admin Dashboard',
            header: true,
            sidebar: true,
            footer: true
        });

    } catch (error) {
        console.log(error.message);
    }
};


module.exports = {
    loadDashboard
}