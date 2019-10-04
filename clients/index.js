const express = require('express');
const app = express();
const fs = require('fs')
var path = require('path')

var http = require('https').createServer({
    key: fs.readFileSync('abels-key.pem'),
    cert: fs.readFileSync('abels-cert.pem')
},app);;

app.set('view engine','ejs');
app.set('views','./views');

app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function(req,res){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.render('home')
})

http.listen(3000, function(){
    console.log('listening on *: https://localhost:3000');
});