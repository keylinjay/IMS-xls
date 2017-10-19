const mongoose = require('mongoose');

const DB_URL = 'mongodb://localhost/DC_db';

//连接
mongoose.connect(DB_URL, { useMongoClient: true });

// 连接成功
mongoose.connection.on('connected', ()=>{
    console.log('mongose connection to open ' + DB_URL);
});

// 连接异常
mongoose.connection.on('error', (err)=>{
    console.log('mongose connection error :' + err);
});

// 连接断开
mongoose.connection.on('disconnected', ()=>{
    console.log('mongose connection disconnected ' + DB_URL);
});

module.exports = mongoose;