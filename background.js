function apiQuery()
{
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "POST", 'https://api.cryptsy.com/api', false );
	var postData = "method=allmyorders&nonce=" + new Date().getTime()
	xmlHttp.setRequestHeader("Sign", CryptoJS.HmacSHA512(postData, "ec794ce9265be51d4b4d084a0f9fd16decd34c4dbf1d4bbc4358019a0a2758e2db43b898a4e33d42"))
	xmlHttp.setRequestHeader("Key", "a7c0f75dddd9b2b14e0818770099bb5789bbb9a7")
	xmlHttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlHttp.send( postData );
	return xmlHttp.responseText;
}


function main(){
	var data = apiQuery();
	var result = JSON.parse(data);
	var notification = webkitNotifications.createNotification(
						  'icon.png',  // icon url - can be relative
						  'Hello!',  // notification title
						   window.localStorage["publicKey"]  // notification body text
						);

notification.show();
setTimeout(main, 3000);
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "hello")
      {
		  var notification = webkitNotifications.createNotification(
						  'icon.png',  // icon url - can be relative
						  'Hello!',  // notification title
						   12345678765433456789  // notification body text
						);

notification.show();
		  }
  });

main()
