function showNotification(order)
{
	if (navigator.appVersion.indexOf("Win")!=-1)
	{
		showWindowNotification(getItems(order));		
	}
	else
	{
		showOtherNotification(getMessage(order));
	}
}

function showWindowNotification(data)
{
	var opt = {
        type: "list",
        title: "Changes in open orders",
        message: "",
        iconUrl: "../icon.png",
        items: data
    };
    chrome.notifications.create(new Date().getTime().toString(), opt, function(){});
}

function showOtherNotification(message)
{
	var notification = webkitNotifications.createNotification(
							  '../icon.png',
							  'Changes in open orders',
							   message
							);
	notification.show();
}

function getMarketName(order)
{
	var marketName = 'unknown';	
	$.each(markets, function(j, market) {
					if (market.marketid == order.marketid)
					{
						marketName = market.label;
						return false;
					}
				});
	return marketName;
}

function getMessage(order)
{
		return justifyRight("Market: " + getMarketName(order), notificationSymbolWidth) +
		   justifyRight("OrderType: " + order.ordertype, notificationSymbolWidth) +
		   justifyRight("Price: " + order.price, notificationSymbolWidth) +
		   justifyRight("Quantity: " + Math.ceil(order.quantity), notificationSymbolWidth);
}

function getItems(order)
{
		return [getItem("Market:", getMarketName(order)),
				   getItem("OrderType:", order.ordertype),
				   getItem("Price:", order.price),
				   getItem("Quantity:", Math.ceil(order.quantity).toString())
				];
}

function justifyRight(s, w){
	while (s.length < w){
		s = s + " ";
	}
	return s;
}

function getItem(t, m){
	return {message:m, title:t};
}