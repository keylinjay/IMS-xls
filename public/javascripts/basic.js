
// console.log($vue);

function hasClassName (el, str) {
    return el.className.match(str);
}
function addClassName (el, className){
    if (hasClassName(el, className)){
        return;
    }else{
        el.className += ' ' + className;
    }
}
function removeClassName (el, className){
    var reg = new RegExp('\\s*' + className);
    // console.log(reg.test(className));
    if (hasClassName(el, className)){
        el.className = el.className.replace(reg, '');
    }
}
function toogleClassName (el, className){
    if (hasClassName(el, className)){
        removeClassName(el, className);
    }else{
        addClassName(el, className);
    }
}

function renderData (arrTitle, arrRecords){
    var html = '';
    arrRecords.forEach((record)=>{
        html += '<tr class="record">';
        arrTitle.forEach((title)=>{
            if(title === 'id'){
                html += `<td name="${title}" value="${record[title] || ''}" disabled class="value hide ${title}">${record[title] || ''}</td>`;
            }else{
                html += `<td name="${title}" value="${record[title] || ''}" disabled class="value ${title}">${record[title] || ''}</td>`;
            }
        });
        html += `<td class="btn remove">删除</td>
            <td class="btn fix">修改</td>
            <td class="btn update disable">确认提交</td>
            </tr>`;
    });
    return html;
}
//定义事件处理函数
function eventProx(el, className, eventType, cb, boolean) {
    var boolean = boolean || false;
    el.addEventListener(eventType, (event) => {
        var target = event.target;
        if (target.className.match(className)) {
            cb(event);
        }
    }, boolean);
}
//定义选择函数
function $q(name, env) {
    if (env) return env.querySelectorAll(name);

    return document.querySelectorAll(name);
}
//定义ajax
function ajax(type, url, cb, data) {
    var type = type || 'get';
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4 && xmlhttp.status === 200) {
            console.log(xmlhttp.responseText);
            cb(xmlhttp.responseText);
        } else {
            // console.log('ajax失败');
        }
    }
    xmlhttp.open(type, url, true);
    // xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=utf-8");
    xmlhttp.setRequestHeader("Content-type", "application/json;charset=utf-8");
    xmlhttp.send(data);
}
// 获取元素value自定义属性的值
function elGetVal (el){
    
    return el.getAttribute('value');
}
// 设置元素的value自定义属性的值
function elSetVal (el, val){
    el.setAttribute('value', val);
    
}
// 获取元素name自定义属性的值
function elGetName (el){
 
    return el.getAttribute('name');
}


eventProx($q('#panel')[0], 'add', 'click', (event) => {
    var target = event.target;
    var parent = target.parentNode;
    var data = panelData;
    // [].forEach.call(parent.querySelectorAll('td.value'), (el) => {
    //     console.log(el.querySelectorAll('input')[0].value);
    //     data[elGetName(el)] = el.querySelectorAll('input')[0].value;
    // });
    
    ajax('post', '/add', (res) => {
        data.id = JSON.parse(res);
        console.log(data);
        [].forEach.call(parent.querySelectorAll('input'), (el) => {
            el.value = '';
        });
        console.log('ajax success');
        // parent.parentNode.removeChild(parent);
        
        var firstEl = $q('#records')[0].querySelectorAll('.record')[0];
        var newEl = firstEl.cloneNode(true);
        [].forEach.call(newEl.querySelectorAll('.value'), (el)=>{
            elSetVal(el, data[elGetName(el)]);
            el.innerText = elGetVal(el);
        });
        console.log(newEl.innerHTML);
        $q('#records')[0].insertBefore(newEl, firstEl);

    }, JSON.stringify(data));
});

eventProx($q('#panel')[0], 'find', 'click', (event) => {
    var target = event.target;
    var parent = target.parentNode;
    var data = panelData;
    // [].forEach.call(parent.querySelectorAll('td.value'), (el) => {
    //     console.log(el);
    //     if (el.querySelectorAll('input')[0].value){
    //         data[elGetName(el)] = el.querySelectorAll('input')[0].value;
    //     }
    // });
    console.log(data);
    ajax('post', '/find', (res) => {
    
        res = res.replace(/\"_id\":/g, '\"id\":');
        console.log(res);
        [].forEach.call(parent.querySelectorAll('input'), (el) => {
            // el.value = '';
        });
        res = JSON.parse(res);
        // res.id = res._id;
        console.log(res);
        $q('#records')[0].innerHTML = renderData(res.dataTitle, res.records);
        // $q('#records')[0].innerHTML = res;
        console.log('ajax success');

    }, JSON.stringify(data));
});

eventProx($q('#records')[0], 'update', 'click', (event) => {
    var target = event.target;
    var parent = target.parentNode;
    var data = {};
    [].forEach.call(parent.querySelectorAll('td.value'), (el) => {
        console.log(el);
        elSetVal(el, el.querySelectorAll('input')[0].value);
        data[elGetName(el)] = elGetVal(el);
    });
    console.log(data);
    ajax('post', '/update', () => {
        [].forEach.call(parent.querySelectorAll('td.value'), (el) => {
            let input = el.querySelectorAll('input')[0];
            let val = input.value;
    
            el.removeChild(input);
    
            el.innerText = val;
        });
        console.log('ajax success');
        // parent.parentNode.removeChild(parent);
        toogleClassName(target, 'disable');
        toogleClassName(parent.querySelectorAll('.fix')[0], 'disable');
        toogleClassName(parent.querySelectorAll('.cancel')[0], 'disable');
    }, JSON.stringify(data));
});

eventProx($q('#records')[0], 'remove', 'click', (event) => {
    var target = event.target;
    var parent = target.parentNode;
    var data = {};
    [].forEach.call(parent.querySelectorAll('td.value'), (el) => {
        console.log(elGetName(el));
        data[elGetName(el)] = elGetVal(el);
        console.log(data);
    });
    console.log(data);
    ajax('post', '/remove', () => {
        parent.parentNode.removeChild(parent);
        console.log('ajax success');
        
    }, JSON.stringify(data));
});

eventProx($q('#records')[0], 'fix', 'click', (event) => {
    var target = event.target;
    var parent = target.parentNode;
    [].forEach.call(parent.querySelectorAll('td.value'), (el) => {

        let input = document.createElement('input');
        input.className = el.className;
        input.value = el.innerText;
        //清空原来单元格的内容
        el.innerText = '';
        //插入可编辑的输入框
        el.appendChild(input);

    });
    toogleClassName(target, 'disable');
    toogleClassName(parent.querySelectorAll('.cancel')[0], 'disable');
    toogleClassName(parent.querySelectorAll('.update')[0], 'disable');
});

eventProx($q('#records')[0], 'cancel', 'click', (event) => {
    var target = event.target;
    var parent = target.parentNode;
    [].forEach.call(parent.querySelectorAll('td.value'), (el) => {
       
        console.log(el.innerHTML);
        let input = el.querySelectorAll('input')[0];
        let val = input.value;

        el.removeChild(input);

        el.innerText = val;

        
    });
    toogleClassName(target, 'disable');
    toogleClassName(parent.querySelectorAll('.fix')[0], 'disable');
    toogleClassName(parent.querySelectorAll('.update')[0], 'disable');
});


//细部的事件添加
var panelData = {};
eventProx($q('#panel')[0], 'value', 'change', (event) => {
    var target = event.target;
    console.log('成功触发了change事件');
    if (target.tagName.toLowerCase() === 'input'){
        panelData[elGetName(target)] = target.value;
    }else if(target.tagName.toLowerCase() === 'select'){
        let selectval = target.options[target.selectedIndex].value;
        panelData[elGetName(target)] = selectval;
    }
});

// focus , blur事件 遇到不支持的标签 无法继续冒泡传递，所以要采用捕获机制 添加参数true
eventProx($q('#panel')[0], 'value', 'focusin', (event) => {
    var target = event.target;
    console.log('成功触发了focus事件');
    // console.log(target);
    if (target.tagName.toLowerCase() === 'input'){
        toogleClassName($q('.sug', target.parentNode)[0], 'disable');
    }
});

eventProx($q('#panel')[0], 'value', 'focusout', (event) => {
    var target = event.target;
    console.log('成功触发了blur事件');
    if (target.tagName.toLowerCase() === 'input'){
        setTimeout(()=>{
            toogleClassName($q('.sug', target.parentNode)[0], 'disable');
        },500);
        // toogleClassName($q('.sug', target.parentNode)[0], 'disable');
    }
});

// sug 建议面板的 建议选项被点击后 对应的 input更新值
eventProx($q('#panel')[0], 'sug-val', 'click', (event) =>{
    var target = event.target;
    var val = elGetVal(target);
    console.log($q('input', target.parentNode.parentNode)[0]);
    elSetVal($q('input', target.parentNode.parentNode)[0], val);
    panelData[elGetName(target.parentNode)] = val;
});
