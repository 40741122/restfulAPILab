import express from 'express';
import multer from 'multer';
import moment from 'moment';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import users from './users.mjs';
const upload = multer();
dotenv.config();
const secretKey = process.env.SECRET_KEY;

const whitelist = ['http://localhost:5500', 'http://localhost:3000', 'http://127.0.0.1:5500', undefined];
const corsOptions = {
	credentials: true,
	origin(origin, callback) {
		if (whitelist.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error('不允許傳遞資料'));
		}
	},
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
    res.send("首頁");
})

app.post("/api/users/login", upload.none(),  (req, res) => {
    const {account, password} = req.body;
    const user = users.find(u => u.account === account && u.password === password);
    if(user){
        const token = jwt.sign({
            account: user.account,
            name: user.name,
            mail: user.mail,
            head: user.head
        }, secretKey, {expiresIn: "30m"})
        res.status(200).json({
            status: "success",
            token
        })
    }else{
        res.status(400).json({
            status: "error",
            message: "使用者帳號或密碼錯誤"
        });
    }
})

app.post("/api/users/logout",checkToken, (req, res)=>{
    console.log(req.decoded)
    const user = users.find(u => u.account === req.decoded.account);
    if (user) {
      const token = jwt.sign({
        account: user.account,
        name: user.name,
        mail: user.mail,
        head: user.head 
      }, secretKey, { expiresIn: "-10s" });
      res.status(200).json({
        status: "logout success",
        token
      });
    } else {
      res.status(401).json({
        status: "error",
        message: "登出失敗，請稍後重整頁面再試。"
      });
    }
  });

app.post("/api/users/status", checkToken, (req, res) => {
    const user = users.find(u => u.account === req.decoded.account);
    if(user){
        const token = jwt.sign({
            account: user.account,
            name: user.name,
            mail: user.mail,
            head: user.head
        }, secretKey, {expiresIn: "30m"})
        res.status(200).json({
            status: "token ok",
            token
        })
    }else{
        res.status(401).json({
            status: "error",
            message: "請登入"
        });
    }
    res.status(200).json({message: "login status checking success"});
})

app.listen(3000, () => {
    console.log("server at http://localhost:3000");
})

function checkToken(req, res ,next){
    let token =req.get("authorization")
    if (token && token.indexOf("Bearer ") === 0) {
        token = token.slice(7);
        jwt.verify(token, secretKey, (error, decoded) => {
            if(error){
                return res.status(401).json({
                    status: "error",
                    message: "登入驗證失敗，請重新登入"
                });
            }else{
                req.decoded = decoded;
                next();
            }
        })
        next();
    }else{
        res.status(401).json({
            status: "error",
            message: "無登入驗證資料"
        });
    }
}