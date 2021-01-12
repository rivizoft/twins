const {Schema, model} = require('mongoose');

const schema = new Schema({
    image: {
        type: String,
        required: false,
        default: "/images/default_image.png"
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    owner: {
        type: String,
        required: true
    }
})

module.exports = model('story', schema)