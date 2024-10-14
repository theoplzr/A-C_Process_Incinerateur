let clickPoints = [];  // Stockage des points et formulaires

document.getElementById('uploadImage').addEventListener('change', function(e) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const imgElement = document.getElementById('preview');
        imgElement.src = event.target.result;
        document.getElementById('previewContainer').style.display = 'block';
    };
    reader.readAsDataURL(e.target.files[0]);
});

document.getElementById('confirmImage').addEventListener('click', function() {
    const planElement = document.getElementById('plan');
    const previewSrc = document.getElementById('preview').src;
    planElement.src = previewSrc;
    planElement.style.display = 'block';

    document.getElementById('previewContainer').style.display = 'none';
    document.getElementById('planContainer').style.display = 'block';

    document.getElementById('uploadImage').style.display = 'none';  
    const header = document.querySelector('h1');  
    if (header) {
        header.style.display = 'none';  
    }
});

// Générer un ID unique pour chaque point
function generateUniqueId() {
    return 'point-' + Math.random().toString(36).substr(2, 16);
}

// Fonction pour attacher les événements de chaque formulaire individuellement
function attachFormEvents(marker, pointData) {
    const formPopup = document.getElementById('formPopup');

    marker.addEventListener('click', function() {
        document.getElementById('question1').value = pointData.formData.question1 || '';
        document.getElementById('question2').value = pointData.formData.question2 || '';

        const imagePreviewContainer = document.getElementById('imagePreviewContainer');
        imagePreviewContainer.innerHTML = '';  // Nettoyer les prévisualisations précédentes

        // Prévisualisation des images existantes
        if (pointData.formData.images) {
            pointData.formData.images.forEach((imageSrc, index) => {
                let imageContainer = document.createElement('div');
                imageContainer.classList.add('image-container');

                let img = document.createElement('img');
                img.src = imageSrc;
                img.style.maxWidth = '100px';
                img.style.marginRight = '10px';

                // Ajouter un bouton pour supprimer cette image spécifique
                let deleteButton = document.createElement('button');
                deleteButton.textContent = 'Supprimer cette image';
                deleteButton.onclick = function() {
                    // Supprimer l'image du tableau images
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
                images: pointData.formData.images || []  // Assurer que les images restent dans formData
            };

            // Gérer les nouvelles images téléchargées
            const imageUpload = document.getElementById('imageUpload');
            Array.from(imageUpload.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = function(event) {
                    pointData.formData.images.push(event.target.result);  // Stocker l'image
                };
                reader.readAsDataURL(file);  // Lire chaque image
            });

            formPopup.style.display = 'none';
        };

        // Lors de la suppression du formulaire
        document.getElementById('deleteForm').onclick = function() {
            marker.remove();  // Supprime le marqueur
            clickPoints = clickPoints.filter(p => p.id !== pointData.id);  // Retirer du tableau clickPoints
            formPopup.style.display = 'none';  // Ferme le formulaire
        };
    });
}

document.getElementById('plan').addEventListener('click', function(e) {
    const x = e.offsetX;
    const y = e.offsetY;

    // Créer un nouveau marqueur
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
            images: []  // Prépare un tableau pour stocker les images
        }
    };

    // Ajouter le point au tableau clickPoints
    clickPoints.push(pointData);

    // Attacher les événements de chaque formulaire à son propre marqueur
    attachFormEvents(marker, pointData);
});
