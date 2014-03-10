function save() {
	localStorage["publicKey"] = document.getElementById("publicKey").value;;
	localStorage["privateKey"] = document.getElementById("privateKey").value;
}

function load() {

}

	chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
  console.log(response.farewell);
});
