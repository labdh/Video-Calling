const mongoose = require('mongoose')

module.exports = Connection = async () => {

    const URL = "mongodb+srv://123:123@cluster0.ameamlb.mongodb.net/?retryWrites=true&w=majority";

    try {
        await mongoose.connect(URL, { useNewUrlParser : true });
        console.log('Database connected successfully');
    } catch (error) {
        console.log('Error while connecting with database', error);
    }
}