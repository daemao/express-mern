const express = require("express");
const bodyParser = require("body-parser") //добавление библиотеки для обработки форм 
const app  = express();
const cors = require("cors");


//подключение библиотеки монгуз
const mongoose = require('mongoose');
const db_settings = require("./DB_settings"); //загрузка юрл нашей БД
mongoose.connect(db_settings.dev_mode_url, {useNewUrlParser: true});  //подключение  к БД
const UserModel = require ("./models/User"); //путь к нашей модели пользователей




app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//Прослойка(middleware) используется как дополнительный метод для обработки запроса
//Прослойка для записи логов в консоли
const LogMiddleware  = (req,res,next)=>{
	console.log(new Date() +',path:'+ req.url+',method:' + req.method);
	next();
}
//middleware for User data 
const UserFieldsValidatorMiddleware = (req,res,next)=>{
	let errs = [];//массив с ошибками
	if(req.body.email ==="" || !req.body.email){//если нет почты
		errs.push("empty email") //добавить ошибку в массив ошибкок
	}
	if(req.body.username ==="" || !req.body.username){//аналогично для узернейма
		errs.push("empty username")
	}
	if(req.body.id ==="" || !req.body.id){//аналогично для айди
		errs.push("empty id")
	}
	if(errs.length == 0){	 //если нет ошибки
		next();
	}
	else{//если есть ошибка
		res.status(422).send(errs);
	}
}
var users =[
		{
			id:1,
			username:"yersultan",
			email:"yersultan.nagashtay@nu.edu.kz"
		},
		{
			id:2,
			username:"someuser",
			email:"someuser@gmail.com"
		},
		{
			id:3,
			username:"andry",
			email:"andry_mcell@yahoo.com"
		}
	];

const PORT  = 8080;

//базовая функция для получения запроса
app.get("/",(req,res)=>{
	res.send("hello world");
});
//функция для получения айди и имени из URL
app.get("/data/:id/:name",(req,res)=>{
	var result = {
		name:req.params.name,
		id:req.params.id
	}
	res.send(result);
});

app.get("/calculator/:method/:num_one/:num_two",(req,res)=>{
	var method = req.params.method;
	var a = req.params.num_one*1;
	var b = req.params.num_two*1;
	if(method == "SUM"){
		res.send({result:a+b})
	}
	else if(method == "SUB"){
		res.send({result:a-b})
	}
	else if(method == "MUL"){
		res.send({result:a*b})
	}
	else if(method == "DIV"){
		res.send({result:a/b})
	}
	else if(method == "EXP"){
		var result = 1;
		for (var i =0;i<b ;i++){
			result = result *a;
		}
		res.send({result:result})
	}
	else{
		res.send({error:"INPUTS ARE NOT CORRECT"})
	}
})
app.get("/search/:key/:value",(req,res)=>{
	
	var result ;
	for (let i=0;i<users.length; i++){
		if(req.params.key == "email"){
			if (users[i].email == req.params.value){
				result = users[i];
			}
		}
		else if(req.params.key == "username"){
			if(users[i].username == req.params.value){
				result = users[i];
			}
		}
		else if(req.params.key == "id"){
			if (users[i].id == req.params.value){
				result = users[i];				
			}
		}
	}
	res.send(result);

});

//Пост запрос 
app.post("/create_user",LogMiddleware,UserFieldsValidatorMiddleware,(req,res)=>{
	var newUser = req.body;
 	users.push(newUser)	
 	res.send(users);
});

app.get("/all_users",
	LogMiddleware,
	(req,res)=>{
	 return res.send(users);
})


app.listen(PORT ,(err)=>{
	if(err)console.log("Error: ", err);
	console.log("working on port: ",PORT);
})

