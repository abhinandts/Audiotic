const Category = require('../models/categoryModel')
const Product = require('../models/productModel')


// ---- /category-------------------------------

const loadCategory = async (req, res) => {

    try {

        const categoryData = await Category.find()

        res.render('productCategory', {
            nameError: req.query.nameError || false,
            descriptionError: req.query.descriptionError || false,
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
        const trimmedName = name.trim()
        const trimmedDescription = description.trim()

        if (!name || name.trim().length === 0) {
            let options = { nameError: "Category is invalid", descriptionError: "", name, description }
            return renderCategoryPage(res, options)
        }

        if (!description || description.trim().length === 0) {
            let options = { nameError: "", descriptionError: "Please provide Description", name, description }
            return renderCategoryPage(res, options)
        }

        const categoryExists = await Category.findOne({ name: trimmedName })

        if (categoryExists) {
            let options = { nameError: "Category already exit", descriptionError: "", name, description }
            return renderCategoryPage(res, options)
        }

        const category = new Category({ name: trimmedName, description: trimmedDescription })

        await category.save()

        res.redirect('/admin/category')

    } catch (error) {
        console.log(error.message)
    }
}

const renderCategoryPage = async (res, options) => {

    const categoryData = await Category.find({});

    res.render('productCategory', {
        title: "Product Category", header: true, sidebar: true, footer: true,
        categoryData,
        ...options
    });
};

// ---- /disable ----------------------------------

const disableCategory = async (req, res) => {
    try {
        const id = req.params.categoryId
        const category = await Category.findById(id)

        if (category) {
            category.is_active = !category.is_active
            await category.save()

            await Product.updateMany(
                { category: id }, {
                is_active: category.is_active
            })
        }

        res.redirect('/admin/category')

    } catch (error) {
        console.log(error.message)
    }
}

// ---- /editCategory -----------------------------

const loadEditCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId
        const category = await Category.findById(categoryId)
        let options = { nameError: "", descriptionError: "" }
        return renderEditCategoryPage(res, options, categoryId)
    } catch (error) {
        console.log(error.message)
    }
}

const updateCategory = async (req, res) => {
    try {
        const { categoryId, name, description } = req.body

        const trimmedName = name.trim();
        const trimmedDescription = description.trim()

        let options

        if (!trimmedName || trimmedName.length === 0) {
            options = { nameError: "Please enter valid name", descriptionError: "" }
            return renderEditCategoryPage(res, options, categoryId)
        }
        if (!trimmedDescription || trimmedDescription.length === 0) {
            options = { nameError: "", descriptionError: "Please enter valid description" }
            return renderEditCategoryPage(res, options, categoryId)
        }

        const categoryExists = await Category.findOne({ name: trimmedName, _id: { $ne: categoryId } })

        if (categoryExists) {
            options = { nameError: "Entered category is already in use", descriptionError: "" }
            return renderEditCategoryPage(res, options, categoryId)
        }

        await Category.findByIdAndUpdate(categoryId, { name, description })

        res.redirect('/admin/category')

    } catch (error) {
        console.log(error.message)
    }
}

const renderEditCategoryPage = async function (res, options, categoryId) {
    try {
        const category = await Category.findOne({ _id: categoryId })

        res.render('editCategory', {
            title: "editCategory",
            header: true,
            footer: true,
            sidebar: true,
            category: category,
            ...options
        })

    } catch (error) {
        console.error(error.message)
    }
}

module.exports = {
    loadCategory,
    addCategory,
    disableCategory,
    loadEditCategory,
    updateCategory
}