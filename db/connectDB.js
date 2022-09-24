const mongoose = require('mongoose')

const connectServer = mongoose.connect('mongodb+srv://tunde:tunde2022@cluster0.sypr6h8.mongodb.net/?retryWrites=true&w=majority').then(() => {
    console.log('connected')
}).
catch(() => {
    console.log('connection failed')
})

module.exports = connectServer