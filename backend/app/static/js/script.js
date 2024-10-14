let clickPoints = [];  // Stockage des points et formulaires
let selectedImages = [];  // Tableau temporaire pour stocker les images sélectionnées pour les formulaires

// Prévisualiser les images sélectionnées dans le formulaire
document.getElementById('imageUpload').addEventListener('change', function(e) {
    selectedImages = selectedImages.concat(Array.from(e.target.files));
    document.getElementById('imageUpload').value = '';  // Réinitialiser l'input file des images du formulaire
    updateImagePreview();  // Mettre à jour la prévisualisation des images du formulaire
});

function updateImagePreview() {
    const imagePreviewContainer = document.getElementById('previewContainer');
    imagePreviewContainer.innerHTML = '';  // Réinitialiser l'aperçu des images

    selectedImages.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const imgElement = document.createElement('img');
            imgElement.src = event.target.result;
            imgElement.style.maxWidth = '100px';
            imgElement.style.marginRight = '10px';

            // Ajouter un bouton de suppression pour chaque image
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Supprimer';
            deleteButton.onclick = function() {
                selectedImages.splice(index, 1);  // Supprimer l'image du tableau
                updateImagePreview();  // Mettre à jour la prévisualisation après suppression
            };

            imagePreviewContainer.appendChild(imgElement);
            imagePreviewContainer.appendChild(deleteButton);
        };
        reader.readAsDataURL(file);  // Lire chaque fichier sélectionné
    });
}

// Gestion du plan d'incinérateur (champ `input` pour le plan d'incinérateur)
document.getElementById('uploadImage').addEventListener('change', function(e) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const imgElement = document.getElementById('preview');
        imgElement.src = event.target.result;
        document.getElementById('previewContainer').style.display = 'block';
    };
    reader.readAsDataURL(e.target.files[0]);  // Lire l'image du plan
});

// Confirmation du plan d'incinérateur
document.getElementById('confirmImage').addEventListener('click', function() {
    const planElement = document.getElementById('plan');
    const previewSrc = document.getElementById('preview').src;
    planElement.src = previewSrc;
    planElement.style.display = 'block';

    document.getElementById('previewContainer').style.display = 'none';
    document.getElementById('planContainer').style.display = 'block';

    // On ne touche plus à l'input pour le plan d'incinérateur après cette étape
    document.getElementById('uploadImage').style.display = 'none';  
    const header = document.querySelector('h1');  
    if (header) {
        header.style.display = 'none';  
    }
});

function generateUniqueId() {
    return 'point-' + Math.random().toString(36).substr(2, 16);
}

// Attacher les événements de formulaire à chaque point
function attachFormEvents(marker, pointData) {
    const formPopup = document.getElementById('formPopup');

    marker.addEventListener('click', function() {
        document.getElementById('question1').value = pointData.formData.question1 || '';
        document.getElementById('question2').value = pointData.formData.question2 || '';

        const imagePreviewContainer = document.getElementById('imagePreviewContainer');
        imagePreviewContainer.innerHTML = '';  // Nettoyer les prévisualisations précédentes

        if (pointData.formData.images) {
            pointData.formData.images.forEach((imageSrc, index) => {
                let imageContainer = document.createElement('div');
                imageContainer.classList.add('image-container');

                let img = document.createElement('img');
                img.src = imageSrc;
                img.style.maxWidth = '100px';
                img.style.marginRight = '10px';

                let deleteButton = document.createElement('button');
                deleteButton.textContent = 'Supprimer cette image';
                deleteButton.onclick = function() {
                    pointData.formData.images.splice(index, 1);  // Supprimer l'image du tableau
                    imageContainer.remove();  // Supprimer visuellement l'image
                };

                imageContainer.appendChild(img);
                imageContainer.appendChild(deleteButton);
                imagePreviewContainer.appendChild(imageContainer);
            });
        }

        formPopup.style.top = `${pointData.y}px`;
        formPopup.style.left = `${pointData.x}px`;
        formPopup.style.display = 'block';

        document.getElementById('submitForm').onclick = function() {
            pointData.formData = {
                question1: document.getElementById('question1').value,
                question2: document.getElementById('question2').value,
                images: pointData.formData.images.concat(selectedImages.map(file => URL.createObjectURL(file))) || []  // Ajouter les nouvelles images
            };

            selectedImages = [];  // Réinitialiser après soumission
            formPopup.style.display = 'none';
        };

        document.getElementById('deleteForm').onclick = function() {
            marker.remove();  // Supprimer le marqueur
            clickPoints = clickPoints.filter(p => p.id !== pointData.id);  // Retirer du tableau clickPoints
            formPopup.style.display = 'none';  // Fermer le formulaire
        };
    });
}

// Gestion du clic sur le plan pour créer un nouveau point
document.getElementById('plan').addEventListener('click', function(e) {
    const x = e.offsetX;
    const y = e.offsetY;

    let marker = document.createElement('div');
    marker.classList.add('click-point');
    marker.style.top = `${y - 5}px`;
    marker.style.left = `${x - 5}px`;
    document.getElementById('planContainer').appendChild(marker);

    const pointData = {
        id: generateUniqueId(),
        x: x,
        y: y,
        formData: {
            images: []  // Prépare le stockage des images
        }
    };

    clickPoints.push(pointData);

    attachFormEvents(marker, pointData);
});
