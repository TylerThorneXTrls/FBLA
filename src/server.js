const express = require('express')
const multer = require('multer');

const storage = multer.diskStorage({
    destination :function(req,file,cb){cb(null, './public/uploads');
    }
    , filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Generate a unique filename
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
app.post('/form',upload.single('itemImageInput'), (req, res) => {
   try{
    const { data } = req.body
    console.log(req.body)
    if (req.file) {
        res.json({
            succes: true,
            message:"succesfull"
        })
    }
    else {
        res.send("no file has been sent")
        }
    }
   catch (err) {
       console.log(err)
    }

    
})
