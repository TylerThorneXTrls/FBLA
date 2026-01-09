const express = require('express')
const multer = require('multer');
const fs = require('fs')
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("connected to mongodb")
})
.catch((err) => {
    console.log('error:',err)
})

const itemSchematic = new mongoose.Schema({
    personName:{type:String, required:true},
    itemName:{type:String, required:true},
    itemImage:{type:String, required:true},
    itemID:{type:String, required:true}
    
})
const item = mongoose.model("Item", itemSchematic)

const storage = multer.diskStorage({
    destination :function(req,file,cb){cb(null, './public/uploads');
    }
    , filename: function (req, file, cb) {
    cb(null ,Date.now() + '-' + file.originalname); 
  }
});

const upload = multer({ storage: storage });




const app = express()
app.use(express.json())
app.set('view engine', 'ejs')
app.set('views', './veiws')
const data = [
    {
        itemName: "watch",
        
     }
]




const port = 5000
app.get("/", (req, res) => {
    res.render('index')
})
app.get("/list", (req, res) => {
    res.render('list',{items:data})
})
app.get("/form", (req, res) => {
    res.render('form',{items:data})
})
app.listen(port, (req, res) => {
    console.log("server is working")
})
app.post('/form',upload.single('itemImageInput'), async(req, res) => {
   try{
    const {itemName,name  } = req.body
    console.log(itemName,name)
    if (req.file) {
        const newItem = new item ({
            personName: req.body.name,
            itemName: req.body.itemName,
            itemImage: req.file.path,
            itemID: Date.now().toString()
        })
        const save = await newItem.save().then(
        console.log("item save"))
        res.json({
            success: true,
            message:"succesfull"
        })
    }
    else {
        res.json(
            {succes:false,
            message: "no file has been sent"}
        )
        }
    }
   catch (err) {
       console.log(err)
       res.json({
           success: false,
           message:"error when uplaoding"
       })
    }

    
})
app.delete('/delete/:itemID', async (req, res) => {
    const { itemID } = req.params
    console.log(itemID)
    const {personName,itemName, itemImage,itemId } = item.find({itemID:itemID })
    console.log(itemImage)
    await item.deleteOne({ itemID: itemID })
    fs.unlink(itemImage)
    res.json({
        success:true,
        message:" deleted"
    })
})
