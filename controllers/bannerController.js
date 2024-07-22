const Banner = require("../models/bannerModel")

const loadBanners = async (req, res) => {
    try {
        const banners = await Banner.find()
        res.render('banners', { title: 'Banners', header: true, sidebar: true, footer: true, banners })
    } catch (error) {
        console.log(error.message)
    }
}

// ---- /newBanner ----

const newBanner = async (req, res) => {
    try {
        res.render('newBanner', { title: "Add product", header: false, sidebar: false, footer: false, })
    } catch (error) {
        console.log(error.message)
    }
}
const addBanner = async (req, res) => {
    try {
        const { heading4, heading2, heading1, paragraph, route } = req.body
        const imageNames = req.files.map(file => file.filename)
        const banner = new Banner({
            heading4,
            heading2,
            heading1,
            paragraph,
            route,
            image: imageNames
        })
        await banner.save()
        res.redirect('/admin/banners')
    } catch (error) {
        console.log(error.message)
    }
}

//---- deleteBanner ----

const deleteBanner = async (req,res) =>{
    try {
        const id = req.params.bannerId
        console.log(id)
        await Banner.findByIdAndDelete(id)
        console.log(" Banner deleted")

        return res.redirect('/admin/banners')
        
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadBanners,
    newBanner, 
    addBanner,
    deleteBanner
}