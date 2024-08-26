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

        res.status(200).json({ message: 'Coupon status updated' })

    } catch (error) {
        console.error(error)
    }
}

const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({ is_active: true });
        res.json(coupons)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error fetching coupons' })
    }
}

const loadEditCoupon = async (req, res) => {
    try {
        const id = req.params.couponId
        const coupon = await Coupon.findById(id)
        res.render('editCoupon', { title: "Edit Coupons", header: true, sidebar: true, footer: true, coupon })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error fetching coupons' })
    }
}

const updateCoupon = async (req, res) => {
    try {
        const { couponId, couponName, 'coupon-value': couponValue, 'minimum-amount': minimumAmount } = req.body;

        // Find the coupon by its ID and update the relevant fields
        const updatedCoupon = await Coupon.findByIdAndUpdate(
            couponId,
            {
                couponName: couponName,
                couponValue: couponValue,
                minimumAmount: minimumAmount
            },
        );

        if (updatedCoupon) {
            return res.redirect('/admin/coupons');
        } else {
            res.status(404).json({ message: 'Coupon not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating coupon', error: error.message });
    }
};


const checkName = async (req, res) => {
    const couponName = req.query.name;
    try {
        const existingCoupon = await Coupon.findOne({ couponName: couponName });
        res.json({ exists: !!existingCoupon });
    } catch (error) {
        console.error('Error checking coupon name:', error);
        res.status(500).json({ error: 'An error occurred while checking the coupon name' });
    }
}

module.exports = {
    loadCouponPage,
    createCoupon,
    loadCoupons,
    disableCoupon,
    getCoupons,
    loadEditCoupon,
    updateCoupon,
    checkName
}