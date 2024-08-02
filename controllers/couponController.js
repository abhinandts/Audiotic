const Coupon = require('../models/couponModel')

const loadCouponPage = async (req, res) => {
    try {
        res.render('couponsPage', {
            couponNameError: req.query.couponName || false,
            couponValueError: req.query.couponValueError || false,
            minimumAmountError: req.query.minimumAmountError || false,

            title: "Coupons Page", header: true, sidebar: true, footer: true,
            couponName: req.query.couponName || '',
            couponValue: req.query.couponValue || '',
            minimumAmount: req.query.minimumAmount || '',
        })
    } catch (error) {
        console.error(error)
        res.status(500)
    }
}

// const createCoupon = async (req, res) => {
//     try {
//         const { couponName, couponValue, minimumAmount } = req.body
//         const coupon = new Coupon({
//             couponName: couponName,
//             couponValue: couponValue,
//             minimumAmount: minimumAmount
//         })
//         console.log(coupon)

//         await coupon.save()
//         return res.status(200)

//     } catch (error) {
//         console.error(error)
//         return res.status(500)
//     }
// }

const createCoupon = async (req, res) => {
    try {
        const { couponName, couponValue, minimumAmount } = req.body;
        
        // Validate request data
        if (!couponName || !couponValue || !minimumAmount) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Create new coupon
        const coupon = new Coupon({
            couponName: couponName,
            couponValue: couponValue,
            minimumAmount: minimumAmount
        });

        await coupon.save();
        return res.status(201).json({ message: 'Coupon created successfully', coupon });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const checkCouponName = async (req, res) => {
    try {
        const { couponName } = req.body;
        
        if (!couponName) {
            return res.status(400).json({ message: 'Coupon name is required' });
        }

        const existingCoupon = await Coupon.findOne({ couponName: couponName });

        if (existingCoupon) {
            return res.status(409).json({ message: 'Coupon name already exists' });
        } else {
            return res.status(200).json({ message: 'Coupon name is available' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};





module.exports = {
    loadCouponPage,
    createCoupon,
    checkCouponName
}