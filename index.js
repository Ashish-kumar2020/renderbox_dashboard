
const express = require("express");
const {mongoose} = require("mongoose");
const cors = require("cors");
const { renderRouter } = require("./routes/renderRouter");
const app = express();
const PORT_NUMBER = 3020;

app.use(express.json());

app.use("/api/v1/renderRouter", renderRouter)

mongoose.connection.on("connected", () => {
    console.log("Mongoose Connected Successfully");
});

mongoose.connection.on("error", (err) => {
    console.error("Mongoose Connection error:",err);
});

async function main(){
    try{
        await mongoose.connect("mongodb+srv://ashishsinghk2020:uaqSQU6jgIcMPcBP@cluster0.2gwff.mongodb.net/renderbox_dashboard?retryWrites=true&w=majority&appName=renderbox_dashboard");
        console.log("Connected to MongoDb");

        app.listen(PORT_NUMBER, () => {
            console.log(`Server is up and running on Port Number : ${PORT_NUMBER}`);
        });
    } catch(error){
        console.error("Error Connecting to MongoDB : ", error);
        process.exit(1);
    }
}

main();