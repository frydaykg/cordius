var keyObtained = false;
var privateKey = '';
var publicKey = '';
var markets = {}
var notificationSymbolWidth = 70;

function saveOrders(orders)
{
	chrome.storage.local.set(
	{
		"orders" : orders
	});
}

function getMessage(order)
{
	var marketName = 'unknown';	
	$.each(markets, function(j, market) {
					if (market.marketid == order.marketid)
					{
						marketName = market.label;
						return false;
					}
				});
				
	return justifyRight("Market: " + marketName, notificationSymbolWidth) +
		   justifyRight("OrderType: " + order.ordertype, notificationSymbolWidth) +
		   justifyRight("Price: " + order.price, notificationSymbolWidth) +
		   justifyRight("Quantity: " + Math.ceil(order.quantity), notificationSymbolWidth);
}

function justifyRight(s, w){
	while (s.length < w){
		s = s + " ";
	}
	return s;
}

function handleChanges(currentOrders)
{
	chrome.storage.local.get("orders", function (data)
	{
		if (data.orders)
		{
			var diff = [];
			$.each(data.orders, function(i, oldOrder) {
				var was = false;
				$.each(currentOrders, function(j, currentOrder) {
					if (oldOrder.orderid == currentOrder.orderid)
					{
						was = true;
						return false;
					}
				});
				
				if (!was)
				{
					diff.push(data.orders[i]);
				}
			});
			if (diff.length > 0)
				$.each(diff, function(index, order) {
					showNotification(getMessage(order));	
				});
		}
		saveOrders(currentOrders);
	});
	
}

function getKeys(callback){
	keyObtained = false;
	chrome.storage.local.get(["publicKey", "privateKey"], function(data){
		publicKey = data.publicKey;
		privateKey = data.privateKey;
		keyObtained = true;
		callback();
		});
}

function apiQuery(methodName){
	nonce = new Date().getTime()
	var postData = "method=" + methodName +"&nonce=" + nonce
	
	try	{		
		return $.ajax({
				url: "https://api.cryptsy.com/api",
				async: false,
				type: "POST",
				data: postData,
				headers: {
					Sign: CryptoJS.HmacSHA512(postData, privateKey),
					Key: publicKey
				}
			}).responseText;
	}
	catch(error){
		console.log(error);
	}
}

function showNotification(message)
{
	var notification = webkitNotifications.createNotification(
							  '../icon.png',
							  'Changes in open orders',
							   message
							);
	notification.show();
}

function main(){
	if (keyObtained)
	{
		try	{
			var data = apiQuery("allmyorders");
			var result = JSON.parse(data);
			if (result.success)
				handleChanges(result.return);
		}
		catch(error){
			console.log(error);
		}
	}
setTimeout(main, 3000);
}

function getmarketsInfo()
{
	var data = apiQuery("getmarkets");
	markets = JSON.parse(data).return;
}

function onStorageChanges(changes, areaName)
{
	if (areaName === "local")
	{
		if ("publicKey" in changes || "privateKey" in changes)
		{
			getKeys();
		}
	}
}

try	{
	chrome.storage.onChanged.addListener(onStorageChanges);
	getKeys(getmarketsInfo);
	main();
}
catch(error){
	console.log(error);
}
