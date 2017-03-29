layui.define(['element', 'jquery', 'layer'] , function(exports){
	"use strict";

var element = layui.element(),
 	$ = layui.jquery;

var fileobj = {},
	_itemid = 'file-item-',
	_add_file_btn ='add-file-btn',
	_upload_btn = 'layui-upload-btn',
	url = '',
	uForm,
	ress=[],
	file_name = 'file';

var msgConf = {
icon: 2
,shift: 6
},config = {
	//上传路径
	url:url,
	//服务器接收的名称
	file_name:file_name,
	//容器名称
	container:'',
	//回调函数
	complete:function(){},
};

function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

function delFile(key, callback){
	if(!(key in fileobj)){return;}
	delete fileobj[key];
	$('#'+key).remove();
	typeof(callback) === 'function' && callback();
}

function addFile(flist, callback){ console.log(flist);
	if (!flist) {return;}
	var len = Object.keys(fileobj).length;
	if(len == 0){$(config.container + ' tbody').empty();}
	for (var i = 0; i < flist.length; i++) {
		var key = guid();
		fileobj[key] = flist[i];
		add_file_item(key, fileobj[key].name);
	}
	callback();
}
function check_data(){
		change_del_btn('#'+_upload_btn, Object.keys(fileobj).length);
	}

function change_del_btn(obj, index){
		index && $(obj).removeClass('layui-btn-disabled') || $(obj).addClass('layui-btn-disabled');
	}

function add_file_item(key, name){
	var tr=[];
		tr.push('<tr id="'+key+'">');
		tr.push('<td>'+ name + '</td>');
		tr.push('<span>'+name+'</span>');
		tr.push('<input class="new-file-name" type="hidden" value=""/>');
		tr.push('<td><div class="layui-progress" lay-filter="'+key+'">');
		tr.push('<div class="layui-progress-bar" lay-percent="0%"></div>');
		tr.push('</div></td>');
		tr.push('<td class="layui-icon-status">');
		tr.push('<i class="layui-icon layui-fg-gray layui-item-wait" style="font-size: 20px">...</i>');
		tr.push('<i class="layui-icon layui-fg-gray layui-item-going" style="font-size: 20px;display:none">&#xe63d;</i>');
		tr.push('<i class="layui-icon layui-fg-green layui-item-success" style="font-size: 20px;display:none">&#xe610;</i>');
		tr.push('<i class="layui-icon layui-fg-red layui-item-error" style="font-size: 20px;display:none">&#x1007;</i>');
		tr.push('</td>');
		tr.push('<td><a id="del-item-'+key+'" class="layui-btn layui-btn-primary layui-btn-mini del-item" data-itemid="'+key+'"><i class="layui-icon">&#xe640;</i></a></td>');
		tr.push('</tr>');
		$(config.container + ' tbody').append(tr.join(''));
}
function changeIconCss(key,item, st){
		$('#'+key+' .layui-icon-status i').css({'display':'none'});
		$('#'+key+' .layui-icon-status .layui-item-'+item).css({'display':'block'});
		st && st == 1 && $('#' + key + ' .layui-progress-bar').addClass('layui-bg-red');
	}


function upload(formobj,key, callback){
	var stop = 1;
	function s(res){ 
		typeof callback === 'function' && callback(res, key);
	}
	function c(xhr){
		delete fileobj[key];
		stop = 0;
		element.progress(key, '100%');
	}
	function e(xhr, error, obj){
		changeIconCss(key,'error', 1);
	}
	var n = 0, timer = setInterval(function(){
		
		if(stop){
			n = n + Math.random()*10|0;
			if (n>99) {
				clearInterval(timer);
				n = 99;
			}
			element.progress(key, n+'%');
		}else{
			clearInterval(timer);
		}
		
	},30);
	var settings = {
	  url: config.url,
	  type:'post',
	  data: formobj,
	  success: s,
	  processData:false,
	  contentType:false,
	  dataType: 'json',
	  complete:c,
	  error:e,
	}
	$.ajax(settings);
}

var MUpload = function(options){

    for(var k in config){
    	options[k] && (config[k]= options[k]);
    }
    
  };

 MUpload.prototype.init = function(){
 	if(!$(config.container)[0]){
 		layer.msg('container 不存在', msgConf);
 		return;
 	}
 	ress = [];
 	var thead = [];
		thead.push('<thead>');
		thead.push('<tr><th class="layui-elip">');
		thead.push('<span>文件名</span>');
		thead.push('<div class="layui-box layui-upload-button layui-upload-button-small">');
		thead.push('<input id="'+_add_file_btn+'" name="" value="" lay-title="批量上传" multiple="multiple" type="file">');
		thead.push('<span class="layui-upload-icon"><i class="layui-icon">&#xe608;</i>添加文件</span>');
		thead.push('</div>');
		thead.push('&nbsp;<a id="'+_upload_btn+'" class="layui-btn layui-btn-disabled layui-upload-button-small"><i class="layui-icon">&#xe62f;</i>上传文件</a>');
		thead.push('</th>');
		thead.push('<th>进度条</th>');
		thead.push('<th>状态</th>');
		thead.push('<th>操作</th>');
		thead.push('</tr></thead>');
		
		$(config.container).append(thead.join(''));

		$(config.container).append('<tbody></tbody>');


		$(config.container).on('click', '.del-item', function(){
			var key = $(this).data('itemid');
			delFile(key, check_data);
		});

		$(config.container).on('change','#'+_add_file_btn, function(){ console.log('this.files');
			if(!this.files || this.files.length == 0){
				return;
			}
			addFile(this.files,check_data);
		});

		$(config.container).on('click', '#'+_upload_btn, function(){
			if (!Object.keys(fileobj).length) {return;}
			
			change_del_btn('#'+_upload_btn,0);
			
			uForm = new FormData();
			for(var key in fileobj){
				uForm.append(file_name, fileobj[key]);
				change_del_btn('#del-item-'+key,0);
				changeIconCss(key,'going');
				element.progress(key, '10%');
				
				upload(uForm, key,function(res, key){
					ress.push(res);
					if(typeof res.code && res.code == 0){
						changeIconCss(key,'success');
					}else{
						changeIconCss(key,'error', 1);
					}
				});
			}
			typeof config.complete === 'function' && config.complete(ress);

		});
 }
	//暴露接口
  exports('mupload', function(options){
    var mupload = new MUpload(options = options || {});
    mupload.init();
  });
})