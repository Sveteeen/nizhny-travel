const { Category } = require("../db/models")

const getAllCategories = async () => {
    const categories = await Category.findAll();
    const result = categories.map((c) => ({
        id: c.id,
        name: c.name,
        image: c.image,
    }));

    return result;
};

module.exports = {
    getAllCategories,
}