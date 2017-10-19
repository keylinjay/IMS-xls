var B7 = require('./b7.js');

var dataCache = {};

const CacheTitle = ['文件类型', '发文单位', '收文单位', '抄送单位', '是否需要回复', '状态', '存放地点', '主送部门', '归属包号'];


function updateCache (key){
    B7.distinct(key, (err, records) => {
        if (err) console.log(err);
        console.log(records);
        dataCache[key] = records;
    });
}

function updateCacheAll (){
    CacheTitle.forEach((val, index)=>{
        updateCache(val);
    });
    console.log(dataCache);
}

updateCacheAll();

module.exports = {
    data: dataCache,
    updateKeys: CacheTitle,
    updateCache: updateCache,
    updateCacheAll: updateCacheAll
};