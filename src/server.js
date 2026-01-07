const express = require('express')
const multer = require('multer');



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
app.post('/form', (req, res) => {

    const { data } = req.body
    console.log(req.body)

    res.json({
        succes: true,
        message:"succesfull"
    })
})
