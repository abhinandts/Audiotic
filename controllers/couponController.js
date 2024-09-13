const Coupon = require('../models/couponModel')

const loadCouponPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page - 1) * limit;

        const totalCoupons = await Coupon.countDocuments();
        const totalPages = Math.ceil(totalCoupons / limit)

        // console.log(page,limit,skip,totalCoupons,totalPages)

        const coupons = await Coupon.find()
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit);

        res.render('couponsPage', {
            title: "Coupons Page", header: true, sidebar: true, footer: true, coupons: coupons, currentPage: page, totalPages: totalPages
        });
    } catch (error) {
        console.error(error)
        res.status(500).send("Error occured")
    }
}

const createCoupon = async (req, res) => {
    try {
        const { name, value, minimumAmount, expiryDate } = req.body;

        // Validate expiry date
        const now = new Date();
        const minExpiryDate = new Date(now.getTime() + 5 * 60000); // 5 minutes from now
        const inputDate = new Date(expiryDate);

        if (isNaN(inputDate.getTime())) {
            return res.status(400).json({ success: false, error: 'Invalid expiry date' });
        }

        if (inputDate <= minExpiryDate) {
            return res.status(400).json({ success: false, error: 'Expiry date must be at least 5 minutes in the future' });
        }

        const newCoupon = new Coupon({
            name,
            value,
            minimumAmount,
            expiryDate: inputDate
        });

        await newCoupon.save();
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

const toggleCouponStatus = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ success: false, error: 'Coupon not found' });
        }

        const now = new Date();
        if (coupon.expiryDate <= now) {
            return res.status(400).json({ success: false, error: 'Cannot activate an expired coupon' });
        }


        coupon.is_active = !coupon.is_active;
        await coupon.save();
        res.json({ success: true });


    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
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
        const currentDate = new Date();
        const coupons = await Coupon.find({ expiryDate: { $gt: currentDate }, is_active: true });
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

const paginateCoupons = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 6; // Coupons per page
        const skip = (page - 1) * limit;

        const totalCoupons = await Coupon.countDocuments();
        const totalPages = Math.ceil(totalCoupons / limit);

        const coupons = await Coupon.find()
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            coupons: coupons,
            currentPage: page,
            totalPages: totalPages
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while fetching coupons" });
    }
};

module.exports = {
    loadCouponPage,
    createCoupon,
    loadCoupons,
    disableCoupon,
    getCoupons,
    loadEditCoupon,
    updateCoupon,
    checkName,
    toggleCouponStatus,
    paginateCoupons
}