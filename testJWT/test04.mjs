import jwt from 'jsonwebtoken';
import {secretKey} from './config.mjs';

const tokenString = jwt.sign({userID: '12345'}, secretKey);

const token = jwt.verify(tokenString, secretKey, (error, data) => {
    if(error){
        console.log("Token驗證失敗");
    }else{
        console.log("Token驗證成功", data);
    }
})
