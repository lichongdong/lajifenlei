var payment = {};
var channels = null;
//获取支付通道
mui.plusReady(function(){
	//所有支付通道信息(支付宝和微信)
	plus.payment.getChannels(function(data){
		channels = data;
	}, function(){
		mui.toast('获取支付通道失败')
	})
})


//生成订单号
payment.orderNumber = function(){
	var random  = Math.floor(Math.random()*1000000000 + 1000000000);
	return random + '1';
}



//支付过程的回调
payment.payReq = function(payData,successCb,errorCb){
	doPay(payData,successCb,errorCb);
}

//发送支付请求

function doPay(payData,successCb,errorCb){
	mui.ajax('https://apisz.beecloud.cn/2/rest/app/bill',{
		data:JSON.stringify(payData),
		type:'post',
		dataType:'json',
		contentType:'application/json',
		success:function(data){//后端给我们返回的数据
		    // console.log(JSON.stringify(data))
			var paySrc = '';
			//请求没有问题，可以发起支付操作了
			if( data.result_code == 0 ){
				var payChannel = fGetPayChannel(payData.channel)
				if(payChannel){
					if(payChannel.id == 'alipay'){
						//支付宝支付
						paySrc = data.order_string;
					}else{
						//其他支付
						var staement = {
							appid : data.app_id,
							noncestr : data.nonce_str,
							package : data.package,
							partnerid : data.partner_id,
							prepayid : data.prepay_id,
							timestamp : data.timestamp,
							sign:data.pay_sign
						};
						paySrc = JSON.stringify(staement);
					}
					//请求支付操作
					mui.plusReady(function () {
					    plus.payment.request(payChannel, paySrc, successCb,errorCb);
					})
				}
			}
		}
	})
}
//获取到用户点击的哪种支付方式的通道
function fGetPayChannel(cb_channel){
	var cb_channel_id = '';
	switch(cb_channel){
		case 'ALI_APP':
		    cb_channel_id = 'alipay';
			break;
		case 'WX_APP':
		    cb_channel_id = 'wxpay';
			break;
	}
	for(var i in channels){
		//和用户点击支付方式与 获取到所有的支付通道对比是否相等
		if(channels[i].id == cb_channel_id){
			//当前匹配用户点击的支付方式的通道
			return channels[i];
		}
	}
	return null;
}