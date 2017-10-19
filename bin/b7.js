const mongoose = require('./db.js');

const Schema = mongoose.Schema;

const ObjectId = Schema.ObjectId;
const DCSchema = new Schema({
    '文件类型': String,
    '序号': String, 
    '文件编号': String, 
    '文件名称': String, 
    '发文单位': String, 
    '收文单位': String, 
    '抄送单位': String, 
    '页码': String, 
    '收文时间': String, 
    '是否需要回复': String, 
    '状态': String, 
    '存放地点': String, 
    '主送部门': String, 
    '备注': String, 
    '监理回复日期': String, 
    '设计回复日期': String, 
    '业主回复日期': String, 
    '归属包号': String
});

module.exports = mongoose.model('PA', DCSchema);