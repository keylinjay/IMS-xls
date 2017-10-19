// 加载需求模块
const http = require('http');
const fs = require('fs');
const express = require('express');

const bodyParser = require('body-parser');

const mongoose = require('mongoose');
//定义数据库接口
mongoose.connect('mongodb://localhost/DC_db', { useMongoClient: true });
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
const B7 = mongoose.model('PA', DCSchema);


// 定义参数
const hostname = '127.0.0.1';
const port = 9123;
const indexFileUrl = './index.html';
const resHeader = {
    'Content-Type': 'text/html;charset = "utf-8"'
};
const dataTitle1 = ['id', 'serial', 'name', 'age'];
// 存放数据的标题
const dataTitle = ['id', '文件类型','序号', '文件编号', '文件名称', '发文单位', '收文单位', '抄送单位', '页码', '收文时间', '是否需要回复', '状态', '存放地点', '主送部门', '备注', '监理回复日期', '设计回复日期', '业主回复日期', '归属包号'];

const filetype = ['OSA', 'RFI', 'WSA', 'MSA', 'SSR', '其他TRS', '会议纪要TRS', '信函', 'DIS', 'PA', 'RVO', 'RFO', 'SM', 'CVI', 'SIC', 'COP', 'NCR', '设计传送单'];

const app = express();
//设置静态资源
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('views', './views');
app.set('view engine', 'jade');
app.get('/', (req, res) => {
    B7.find({'文件类型': 'PA'}, (err, records) => {
        if (err) return console.error(err);
        console.log('the find resulst is:');
        console.log(records);
        res.render('index', {
            title: 'key',
            dataTitle: dataTitle,
            filetype: filetype,
            res: records.reverse()
        });
    });
});
app.post('/add', (req, res) => {
    var data = JSON.parse(JSON.stringify(req.body));
    var record = new B7(data);
    record.save((err, record) => {
        if (err) return console.error(err);
        console.log(record);
        console.log('add success.');
        res.send(record._id);
    });
});
app.post('/find', (req, res) => {
    var data = JSON.parse(JSON.stringify(req.body));

    B7.find(data, (err, records) => {
        if (err) return console.error(err);
        console.log('the find resulst is:');
        console.log(records);
        res.send({
            dataTitle: dataTitle,
            records: records.reverse()
        });
        // res.render('find', {
        //     dataTitle: dataTitle,
        //     res: records.reverse()
        // });
    });
});
app.post('/remove', (req, res) => {
    var data = JSON.parse(JSON.stringify(req.body));
    B7.remove({ _id: data.id }, (err) => {
        if (err) return console.error(err);
        console.log(data.id);
        console.log('removed');
        res.send('has removed.');
    });
});
app.post('/update', (req, res) => {
    console.log('接收到浏览器post请求');
    console.log(req.body);
    var data = JSON.parse(JSON.stringify(req.body));
    console.log(data);
    //匹配id需要用_id
    B7.update({ _id: data.id }, data, (err, number, raw) => {
        if (err) return console.error(err);
        console.log('the id:' + data.id + 'has updated.');
        console.log('The number of updated documents was %d', number);
        console.log('The raw response from Mongo was ', raw);
        res.send('has updated.');
    });

});


app.listen(port, hostname, () => {
    console.log(`服务器运行在http://${hostname}:${port}/`);
});

// 引入exceljs模块
const Excel = require('exceljs');
const workbook = new Excel.Workbook();
const readFileName = './成都京东方收文记录.xlsx';
// readFileToDb(readFileName);
// 读取excel数据并保存到数据库中
function readFileToDb (fileName){
    workbook.xlsx.readFile(fileName)
    .then(()=>{
        workbook.eachSheet((worksheet, sheetId)=>{
            console.log(worksheet);
            // 过滤工作表的名字为特定值
            if (worksheet.name){
                worksheet.eachRow((row, rowNumber)=>{
                    
                    let data = {};
                    let titles = dataTitle;
                    // 过滤掉无效的数据
                    if (rowNumber == 1 ||
                        row.getCell(2).value == null ||
                        row.getCell(3).value == null ||
                        row.getCell(4).value == null ||
                        row.getCell(5).value == null
                    ){
                        
                    }else {
                        data[titles[1]] = worksheet.name;
                        for (let i = 2, len = titles.length; i < len; i++){
                            
                            data[titles[i]] = row.getCell(i).value;
                        }
                        console.log('the data is :');
                        console.log(data);
                        let record = new B7(data);
                        record.save((err, record) => {
                            if (err) return console.error(err);
                            console.log(rowNumber);
                            console.log('the record is :');
                            console.log(record);
                            console.log('add success.');
                        });
                    }
                    
                    
                });
            }
            console.log(B7);
        });
    });
}


//下面是写入excel的测试，按此模板写入没有问题
// const sheet = workbook.addWorksheet('data');

// sheet.columns = dataTitle.map((title) => {
//     return {
//         header: title,
//         key: title
//     }
// });

// PA.find((err, records) => {

//     sheet.addRows(records);

//     workbook.xlsx.writeFile('./test.xlsx')
//         .then(() => {
//             console.log('have writen, done.');
//         });
// });

