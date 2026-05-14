const { Tag } = require("../db/models")

const getTags = async () => {
    const tags = await Tag.findAll();
    const result = tags.map((t) => ({
        id: t.id,
        name: t.name,
    }));
    return result;
};

module.exports = { getTags };