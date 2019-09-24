const express = require('express');
const app = express();
var path = require('path')
var http = require('http').createServer(app);

app.set('view engine','ejs');
app.set('views','./views');

app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function(req,res){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.render('home')
})

http.listen(3000, function(){
    console.log('listening on *:3000');
});