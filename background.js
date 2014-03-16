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

function getMessage(diff)
{
	var res = '';
	
	for (var i = 0; i < diff.length; i++)
	{
		var order = diff[i];
		res += order.ordertype + " order " + order.price + " * " + Math.ceil(order.quantity) + " was closed\\canceled";
	}
	
	return res;
}

function handleChanges(currentOrders)
{
	chrome.storage.local.get("orders", function (data)
	{
		if (data.orders)
		{
			var diff = [];
			for (var i = 0; i < data.orders.length; i++)
			{
				var was = false;
				for (var j = 0; j < currentOrders.length; j++)
				{
					if (data.orders[i].orderid == currentOrders[j].orderid)
					{
						was = true;
						break;
					}
				}
				
				if (!was)
				{
					diff.push(data.orders[i]);
				}
			}
			if (diff.length > 0)
				showNotification(getMessage(diff));
			saveOrders(currentOrders);
		}
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

function apiQuery(){
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "POST", 'https://api.cryptsy.com/api', false );
	var postData = "method=allmyorders&nonce=" + new Date().getTime()
	xmlHttp.setRequestHeader("Sign", CryptoJS.HmacSHA512(postData, privateKey))
	xmlHttp.setRequestHeader("Key", publicKey)
	xmlHttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlHttp.send(postData);
	return xmlHttp.responseText;
}

function showNotification(message)
{
	var notification = webkitNotifications.createNotification(
							  'icon.png',  // icon url - can be relative
							  'Changes in open orders',  // notification title
							   message  // notification body text
							);
	notification.show();
}

function main(){
	if (keyObtained)
	{
		var data = apiQuery();
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
