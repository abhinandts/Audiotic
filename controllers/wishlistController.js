

const loadWishlist = async (req,res)=>{
    try {

        res.render('wishlist', { header: true, smallHeader: false, breadcrumb: "Wishlist", footer: true })
        
    } catch (error) {
        console.error(error)
    }
}

module.exports = {
    loadWishlist
}