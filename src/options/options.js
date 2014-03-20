function save() {
	chrome.storage.local.set(
	{
		"publicKey" : $("#publicKey").val(),
		"privateKey" : $("#privateKey").val()
	});
}

function setFields(data) {
	$("#publicKey").val(data.publicKey);
	$("#privateKey").val(data.privateKey);
}

function init()
{
	$("#saveButton").click(save);
	chrome.storage.local.get(["publicKey", "privateKey"], setFields);
}

document.addEventListener("DOMContentLoaded", init);