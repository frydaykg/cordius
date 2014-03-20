var keyObtained = false;
var privateKey = '';
var publicKey = '';

function saveOrders(orders)
{
	chrome.storage.local.set(
	{
		"orders" : orders
	});
}

function getMessage(order)
{
	return order.ordertype + " order " + order.price + " * " + Math.ceil(order.quantity) + " was closed\\canceled";
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

function getKeys(){
	keyObtained = false;
	chrome.storage.local.get(["publicKey", "privateKey"], function(data){
		publicKey = data.publicKey;
		privateKey = data.privateKey;
		keyObtained = true;
		});
}

function apiQuery(methodName){
	nonce = new Date().getTime()
	var postData = "method=" + methodName +"&nonce=" + nonce
		
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
		var data = apiQuery("allmyorders");
		var result = JSON.parse(data);
		if (result.success)
			handleChanges(result.return);
	}
setTimeout(main, 3000);
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

chrome.storage.onChanged.addListener(onStorageChanges);
getKeys();
main();
