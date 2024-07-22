const Category = require('../models/categoryModel')
const Product = require('../models/productModel')


// ---- /category-------------------------------

const loadCategory = async (req, res) => {

    try {

        const categoryData = await Category.find()

        res.render('productCategory', {
            error: req.query.error || false,
            title: "Product Category", header: true, sidebar: true, footer: true,
            categoryData,
            name: req.query.name || '',
            description: req.query.description || '',
        })

    } catch (error) {
        console.log(error.message)
    }
}

// ---- /addCategory ---------------------------

const addCategory = async (req, res) => {
    try {
        const { name, description } = req.body

        const categoryExists = await Category.findOne({ name: name })

        if (categoryExists) {
            return res.render('productCategory', {
                title: "Product Category", header: true, sidebar: true, footer: true,
                categoryData: await Category.find({}),
                error: "Category already exists",
                name,
                description,
            })
        }


        const category = new Category({ name, description })
        await category.save()

        res.redirect('/admin/category')

    } catch (error) {
        console.log(error.message)
    }
}


// ---- /disable ----------------------------------

const disableCategory = async (req, res) => {
    try {
        const id = req.params.categoryId
        const category = await Category.findById(id)


        // if (category.is_active) {
        //     category.is_active = !category.is_active
        //     await category.save()
        // } else {
        //     category.is_active = true
        //     await category.save()
        // }

        if (category) {
            category.is_active = !category.is_active
            await category.save()

            await Product.updateMany(
                { category: id }, {
                is_active: category.is_active
            }
            )

        }

        res.redirect('/admin/category')

    } catch (error) {
        console.log(error.message)
    }
}

// ---- /editCategory -----------------------------

const editCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.categoryId)

        res.render('editCategory', { title: "Edit Category", header: true, sidebar: true, footer: true, category })

    } catch (error) {
        console.log(error.message)
    }
}

// ---- /saveCategory -----------------------------

const saveCategory = async (req, res) => {
    try {
        const { categoryId, name, description } = req.body

        await Category.findByIdAndUpdate(categoryId, { name, description })

        res.redirect('/admin/category')

    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadCategory,
    addCategory,
    disableCategory,
    editCategory,
    saveCategory
}