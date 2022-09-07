"use strict";

const API = "https://api.thedogapi.com/v1";
const API_KEY = "8bd1db34-b5b3-44f7-b419-5de1284f09aa";
const LOADING_CIRCLE = "https://i.stack.imgur.com/MnyxU.gif";

// Load Another Puppy.
let actualRandomPuppy = null;
const RANDOM_PUPPY_IMG = document.getElementById("random-puppy-img");
const LOAD_PUPPY_BTN = document.getElementById("load-puppy-btn");
async function loadRandomPuppyImage() {
	try {
		RANDOM_PUPPY_IMG.src = LOADING_CIRCLE;
		const response = await fetch(`${API}/images/search`, {
			method: "GET",
			headers: {
				"x-api-key": API_KEY
			}
		});
		const puppyImages = await response.json();
		RANDOM_PUPPY_IMG.src = puppyImages[0].url;
		actualRandomPuppy = puppyImages[0];
		
		console.group("Respuestas del Servidor (GET Random Puppy)");
			console.log(response);
			console.log(puppyImages);
		console.groupEnd();
		
	} catch (error) {		
		console.group("Error (GET Random Puppy)");
			console.error(error);
		console.groupEnd();
		alert("Ocurrió un Error en el GET de la imagen aleatoria.");
	}
}
loadRandomPuppyImage();
LOAD_PUPPY_BTN.addEventListener("click", loadRandomPuppyImage);

// Load Favourite Puppies.
const FAVOURITE_CONTENT = document.getElementById("favourite-content");
async function loadFavouritePuppies() {
	try {
		const response = await fetch(`${API}/favourites`, {
			method: "GET",
			headers: {
				"x-api-key": API_KEY
			}
		});
		const favouritesImages = await response.json();
		
		favouritesImages.forEach(attachToHtml);
		
		function attachToHtml(puppyImage){
			const newHtmlDiv = document.createElement("div");
			FAVOURITE_CONTENT.appendChild(newHtmlDiv);
			newHtmlDiv.innerHTML = `
				<button class="saved-puppy__delete-button" onclick="deletePuppyFromFavourites(${puppyImage.id})">X</button>
				<img src="${puppyImage.image.url}" class="saved-puppy__img" />
			`;
			newHtmlDiv.id = `fav-puppy-n${puppyImage.id}`;
			newHtmlDiv.className = "saved-puppy__container";
		}	

		console.group("Respuestas del Servidor (GET Fav Puppies)");
			console.log(response);
			console.log(favouritesImages);
		console.groupEnd();
		
	} catch (error) {	
		console.group("Error (GET Fav Puppies)");
			console.error(error);
		console.groupEnd();
		alert("Ocurrió un Error en el GET para cargar los Favoritos.");
	}
}
loadFavouritePuppies();

// Load Uploaded Puppies.
const UPLOADED_CONTENT = document.getElementById("uploaded-content");
async function loadUploadedPuppies() {
	try {
		const response = await fetch(`${API}/images?limit=100`, {
			method: "GET",
			headers: {
				"x-api-key": API_KEY
			}
		});
		const uploadedImages = await response.json();
	
		uploadedImages.forEach(attachToHtml);
		
		function attachToHtml(puppyImage){
			const newHtmlDiv = document.createElement("div");
			UPLOADED_CONTENT.appendChild(newHtmlDiv);
			newHtmlDiv.className = "saved-puppy__container";
			newHtmlDiv.innerHTML = `
				<button class="saved-puppy__delete-button" onclick="deletePuppyFromUploads('${puppyImage.id}')">X</button>
				<img src="${puppyImage.url}" class="saved-puppy__img" />
			`;
			newHtmlDiv.id = `upload-puppy-${puppyImage.id}`;
		}		
		
		console.group("Respuestas del Servidor (GET Uploaded Puppies)");
			console.log(response);
			console.log(uploadedImages);
		console.groupEnd();
		
	} catch (error) {		
		console.group("Error (GET Uploaded Puppies)");
			console.error(error);
		console.groupEnd();
		alert("Ocurrió un Error en el GET para cargar los Favoritos.");
	}
}
loadUploadedPuppies();

// Save Puppy as a Favourite Puppy.
const SAVE_PUPPY_BTN = document.getElementById("save-puppy-btn");
async function saveAsFavouritePuppy() {
	try {
		const response = await fetch(`${API}/favourites`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": API_KEY
			},
			body: JSON.stringify({
				image_id: actualRandomPuppy.id
			})
		});
		const postResponse = await response.json();
		if (postResponse.message === "SUCCESS") updateFavouritePuppies();
		
		console.group("Respuestas del Servidor (POST Save as Fav)");
			console.log(response);
			console.log(postResponse);
		console.groupEnd();
		
	} catch (error) {	
		console.group("Error (POST Save as Fav)");
			console.error(error);
		console.groupEnd();
		alert("Ocurrió un Error en el POST de los Favoritos.");
	}	
}
async function updateFavouritePuppies() {
	try {
		const response = await fetch(`${API}/favourites`, {
			method: "GET",
			headers: {
				"x-api-key": API_KEY
			}
		});
		const favouritesImages = await response.json();

		const lastUpdate = favouritesImages.length - 1;
		const newHtmlDiv = document.createElement("div");
		FAVOURITE_CONTENT.appendChild(newHtmlDiv);
		newHtmlDiv.innerHTML = `
			<button class="saved-puppy__delete-button" onclick="deletePuppyFromFavourites(${favouritesImages[lastUpdate].id})">X</button>
			<img src="${favouritesImages[lastUpdate].image.url}" class="saved-puppy__img" />
		`;
		newHtmlDiv.id = `fav-puppy-n${favouritesImages[lastUpdate].id}`;
		newHtmlDiv.className = "saved-puppy__container";

		console.group("Respuestas del Servidor (GET Update Favs)");
			console.log(response);
			console.log(favouritesImages);
		console.groupEnd();
		
	} catch (error) {		
		console.group("Error (GET Update Favs)");
			console.error(error);
		console.groupEnd();
		alert("Ocurrió un Error en el GET para actualizar los Favoritos.");
	}
}
SAVE_PUPPY_BTN.addEventListener("click", saveAsFavouritePuppy);

// Delete Puppy from Favourites.
async function deletePuppyFromFavourites(puppyId){
	try {
		showLoadingSceneWhileDeleting();
		const response = await fetch(`${API}/favourites/${puppyId}`, {
			method: "DELETE",
			headers: {
				"x-api-key": API_KEY
			}
		});
		const postResponse = await response.json();
		if (postResponse.message === "SUCCESS") {
			const puppyToDelete = document.querySelector(`#fav-puppy-n${puppyId}`);
			FAVOURITE_CONTENT.removeChild(puppyToDelete);
		}
		
		function showLoadingSceneWhileDeleting() {
			const deleteBtn = document.querySelector(`#fav-puppy-n${puppyId} button`);
			deleteBtn.style = "display: none;"
			
			const img = document.querySelector(`#fav-puppy-n${puppyId} img`);
			const originalImgWidth = img.width;
			img.src = LOADING_CIRCLE;
			img.width = originalImgWidth;		
		}
		
		console.group("Respuestas del Servidor (DELETE from Favs)");
			console.log(response);
			console.log(postResponse);
		console.groupEnd();
		
	} catch (error) {		
		console.group("Error (DELETE from Favs)");
			console.error(error);
		console.groupEnd();
		alert("Ocurrió un Error en el DELETE de los Favoritos.");
	}
}

// Upload a Puppy Image.
async function uploadPuppyImage() {
	try {
		showLoadingSceneWhileUploading();

		const imageUploadForm = document.querySelector("form");
		const formData = new FormData(imageUploadForm);
		console.group("Archivo Subido")
			console.log(formData.get("file"));
		console.groupEnd();
		
		const response = await fetch(`${API}/images/upload`, {
			method: "POST",
			headers: {
				"x-api-key": API_KEY,
			},
			body: formData
		});
		const postResponse = await response.json();
		
		if (response.status === 201) {
			const Uploadform = document.querySelector("form");
			const loadingCircle = document.querySelector("form img");
			Uploadform.removeChild(loadingCircle);
			
			const newHtmlParagraph = document.createElement("p");
			Uploadform.appendChild(newHtmlParagraph);
			newHtmlParagraph.innerText = "Puppy Uploaded Successfully";
			newHtmlParagraph.style = "margin-top:10px; margin-bottom:5px; font-family:'Source Sans Pro', sans-serif; font-weight:bold;"
			updateUploadedPuppies();
		}
		
		function showLoadingSceneWhileUploading() {
			const Uploadform = document.querySelector("form");
			
			const previousParagraph = document.querySelector("form p");
			if (previousParagraph) Uploadform.removeChild(previousParagraph);
						
			const newHtmlImg = document.createElement("img");
			Uploadform.appendChild(newHtmlImg);
			newHtmlImg.src = LOADING_CIRCLE;
			newHtmlImg.style = "height: 50px; display: block; margin: 10px auto; margin-top: 15px;"
		}
		
		console.group("Respuestas del Servidor (POST Upload Puppy)");
			console.log(response);
			console.log(postResponse);
		console.groupEnd();
		
	} catch (error) {		
		console.group("Error (POST Upload Puppy)");
			console.error(error);
		console.groupEnd();
		alert("Ocurrió un Error en el POST al subir la imagen.");
	}	
}
async function updateUploadedPuppies() {
	try {
		const response = await fetch(`${API}/images`, {
			method: "GET",
			headers: {
				"x-api-key": API_KEY
			}
		});
		const uploadedImages = await response.json();

		const lastUpdate = uploadedImages.length - 1;
		const newHtmlDiv = document.createElement("div");
		UPLOADED_CONTENT.insertBefore(newHtmlDiv, document.querySelector("#uploaded-content div"));
		newHtmlDiv.className = "saved-puppy__container";
		newHtmlDiv.innerHTML = `
			<button class="saved-puppy__delete-button" onclick="deletePuppyFromUploads('${uploadedImages[lastUpdate].id}')">X</button>
			<img src="${uploadedImages[lastUpdate].url}" class="saved-puppy__img" />
		`;
		newHtmlDiv.id = `upload-puppy-${uploadedImages[lastUpdate].id}`;
		
		console.group("Respuestas del Servidor (GET Update Uploads)");
			console.log(response);
			console.log(uploadedImages);
		console.groupEnd();
		
	} catch (error) {		
		console.group("Error (GET Update Uploads)");
			console.error(error);
		console.groupEnd();
		alert("Ocurrió un Error en el GET para actualizar las Updates.");
	}
}


// Delete Puppy from Uploads.
async function deletePuppyFromUploads(puppyId){
	try {
		showLoadingSceneWhileDeleting();
		const response = await fetch(`${API}/images/${puppyId}`, {
			method: "DELETE",
			headers: {
				"x-api-key": API_KEY
			}
		});

		if (response.status >= 200 && response.status <= 299) {
			const puppyToDelete = document.querySelector(`#upload-puppy-${puppyId}`);
			UPLOADED_CONTENT.removeChild(puppyToDelete);
		}
		
		function showLoadingSceneWhileDeleting() {
			const img = document.querySelector(`#upload-puppy-${puppyId} img`);
			const originalImgWidth = img.width;
			img.src = LOADING_CIRCLE;
			img.width = originalImgWidth;		
		}

		console.group("Respuestas del Servidor (DELETE from Uploads)");
			console.log(response);
		console.groupEnd();
		
	} catch (error) {
		console.group("Error (DELETE from Uploads)");
			console.error(error);
		console.groupEnd();
		
		alert("Ocurrió un Error en el DELETE de las Uploads.");
	}
}