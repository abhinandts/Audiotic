const Coupon = require('../models/couponModel')

const loadCouponPage = async (req, res) => {
    try {
        res.render('couponsPage', {
            title: "Coupons Page", header: true, sidebar: true, footer: true,
        })
    } catch (error) {
        console.error(error)
        res.status(500)
    }
}

const createCoupon = async (req, res) => {
    try {
        const { couponName, couponValue, minimumAmount } = req.body;

        // Validate request data
        if (!couponName || !couponValue || !minimumAmount) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingCoupon = await Coupon.findOne({ couponName: couponName });

        if (existingCoupon) {
            return res.status(409).json({ message: 'Coupon name already exists' });
        } else {
            // Create new coupon
            const coupon = new Coupon({
                couponName: couponName,
                couponValue: couponValue,
                minimumAmount: minimumAmount
            });

            await coupon.save();
            return res.status(201).json({ message: 'Coupon created successfully', coupon });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const loadCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find()
        return res.status(200).json(coupons)

    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: error });
    }
}

const disableCoupon = async (req, res) => {
    try {
        const { couponId } = req.body
        const coupon = await Coupon.findById(req.body.couponId);

        if (!coupon) {
            return res.status(404).json({ message: 'coupon not found' })
        }
        coupon.is_active = !coupon.is_active

        await coupon.save();

        res.status(200).json({message:'Coupon status updated'})

    } catch (error) {
        console.error(error)
    }
}

const getCoupons = async (req,res)=>{
    try {
        const coupons = await Coupon.find({is_active:true});
        res.json(coupons)
    } catch (error) {
        console.error(error)
        res.status(500).json({message:'Error fetching coupons'})
    }
}

module.exports = {
    loadCouponPage,
    createCoupon,
    loadCoupons,
    disableCoupon,
    getCoupons
}