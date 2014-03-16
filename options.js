function save() {
	chrome.storage.local.set(
	{
		"publicKey" : document.getElementById("publicKey").value,
		"privateKey" : document.getElementById("privateKey").value
	});
}

function setFields(data) {
	document.getElementById("publicKey").value = data.publicKey;
	document.getElementById("privateKey").value = data.privateKey;
}

function init()
{
	document.getElementById("saveButton").addEventListener("click", save);
	chrome.storage.local.get(["publicKey", "privateKey"], setFields);
}

document.addEventListener("DOMContentLoaded", init);
