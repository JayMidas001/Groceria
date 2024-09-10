const mongoose = require(`mongoose`)
require(`dotenv`).config()
const URL = process.env.db


mongoose.connect(URL).then(()=>{
    
    console.log(`Connection to MongoDB has been established successfully.`);
}).catch((error)=>{
    console.log(`Unable to establish connection to DB because ${error}`);
})