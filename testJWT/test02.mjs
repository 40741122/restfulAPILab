import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const secrectKey = process.env.SECRET_KEY;

const tokenString = jwt.sign({userID: '12345'}, secrectKey);

const token = jwt.verify(tokenString, secrectKey, (error, data) => {
    if(error){
        console.log("Token驗證失敗");
    }else{
        console.log("Token驗證成功", data);
    }
})
