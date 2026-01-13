const express = require('express')
const multer = require('multer');
const path = require('path');
const fs = require('fs')
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const saltRounds = 14
const jwt = require('jsonwebtoken')



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
    itemID:{type:String, required:true},
    itemDescription:{type:String, required:false},
    ContactInfo: { type: String, required: true },
    success:{type:Boolean,required:false}
    
})
const userSchematic = new mongoose.Schema({
    userName: { type: String, required: true },
    password: { type: String, required:true}
    
})
const user = mongoose.model('user',userSchematic)
const item = mongoose.model("Item", itemSchematic)

const storage = multer.diskStorage({
    destination :function(req,file,cb){cb(null, './uploads');
    }
    , filename: function (req, file, cb) {
    cb(null ,Date.now() + '-' + file.originalname); 
  }
});

const upload = multer({ storage: storage });




const app = express()
app.use('/styles', express.static(path.join(__dirname, '..', 'styles')));
app.use(express.json())
app.set('view engine', 'ejs')
app.set('views', './veiws')

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));




const port = 5000
app.get("/", (req, res) => {
    res.render('index')
})
app.get("/list", async (req, res) => {
    const data = await item.find({})
    res.render('list',{items:data})
})
app.get("/form", (req, res) => {
    res.render('form')
})
app.get("/admin", async (req, res) => {
    const data = await item.find({success:false})
    res.render('admin',{items:data})
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
            itemID: Date.now().toString(),
            itemDescription: req.body.description,
            ContactInfo: req.body.ContactInfo,
            success:false
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
           message:err
       })
    }

    
})
app.delete('/delete/:itemID', async (req, res) => {
    const { itemID } = req.params
    console.log(itemID)
    const foundItem = await item.findOne({ itemID })
    console.log(foundItem)
    if (!foundItem) {
    return res.status(404).json({ success: false, message: "Item is not found" })
    }
    const itemImage = foundItem.itemImage

    
    fs.promises.unlink(itemImage)
    await item.deleteOne({ itemID: foundItem.itemID })
    res.json({
        success:true,
        message:" deleted"
    })
})
app.delete('/deleteAll', async (req, res) => {
        const uploadsPath = path.join(__dirname,'..', 'uploads');
        await fs.promises.rm(uploadsPath, { recursive: true, force: true });
        fs.mkdirSync(uploadsPath);
         await item.deleteMany({});
    res.json({
        success:true,
        message:" deleted"
    })
})
app.post('/createAdmin', async (req, res) => {
    try {
        const { username, password } = req.body

        const hash = await bcrypt.hash(password, saltRounds)

        const newUser = new user({
            userName: username,
            password: hash
        })

        await newUser.save()

        res.json({
             success: true,
             message: "admin created"
             })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body
        const foundUser = await user.findOne({ userName:username })
        if (foundUser) {
            const match = await bcrypt.compare(password, foundUser.password)
            if (match){
            const token = jwt.sign(
            {
                 userName:foundUser.userName,
              

            },
            process.env.JWTSecret,
            {expiresIn:'3h'}
           
        )
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'strict',
             maxAge: 3 * 60 * 60 * 1000
})
         res.json({
                success:true,
                message:"login successful",
                token:token
            })
            
     




                
            }
        }
        else{
            res.json({
                success:false,
                message:"user is not found"
            })
        }

        
        
    }catch (err) {   
        res.status(500).json({ success: false, error: err.message })
    }
}
)
