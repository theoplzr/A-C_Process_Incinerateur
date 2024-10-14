let clickPoints = [];  // Stockage des points et formulaires

// Sauvegarde dans localStorage
function saveToLocalStorage() {
    localStorage.setItem('clickPoints', JSON.stringify(clickPoints));
}

// Charger les points à partir de localStorage
function loadFromLocalStorage() {
    const savedPoints = JSON.parse(localStorage.getItem('clickPoints'));
    if (savedPoints) {
        savedPoints.forEach(pointData => {
            let marker = document.createElement('div');
            marker.classList.add('click-point');
            marker.style.top = `${pointData.y - 5}px`;
            marker.style.left = `${pointData.x - 5}px`;
            document.getElementById('planContainer').appendChild(marker);

            clickPoints.push(pointData);  // Ajoute les points dans le tableau clickPoints

            attachFormEvents(marker, pointData);  // Attache les événements de formulaire
        });
    }
}

// Charger les points au démarrage
document.addEventListener('DOMContentLoaded', loadFromLocalStorage);

// Mettre à jour la liste des points dans l'interface
function updatePointsList() {
    const pointsList = document.getElementById('pointsList');
    pointsList.innerHTML = '';  // Nettoyer la liste actuelle

    clickPoints.forEach((pointData, index) => {
        const listItem = document.createElement('li');
        listItem.innerText = `Point ${index + 1} - X: ${pointData.x}, Y: ${pointData.y}`;
        listItem.onclick = () => {
            // Simuler un clic sur le point pour ouvrir le formulaire
            document.querySelector(`.click-point:nth-child(${index + 1})`).click();
        };
        pointsList.appendChild(listItem);
    });
}

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
                    saveToLocalStorage();  // Sauvegarder après suppression
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
                    saveToLocalStorage();  // Sauvegarder après ajout d'image
                };
                reader.readAsDataURL(file);  // Lire chaque image
            });

            formPopup.style.display = 'none';
            saveToLocalStorage();  // Sauvegarder après modification du formulaire
            updatePointsList();  // Mettre à jour la liste des points
        };

        // Lors de la suppression du formulaire
        document.getElementById('deleteForm').onclick = function() {
            marker.remove();  // Supprime le marqueur
            clickPoints = clickPoints.filter(p => p.id !== pointData.id);  // Retirer du tableau clickPoints
            formPopup.style.display = 'none';  // Ferme le formulaire
            saveToLocalStorage();  // Sauvegarder après suppression
            updatePointsList();  // Mettre à jour la liste des points
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
    saveToLocalStorage();  // Sauvegarder après ajout d'un point
    updatePointsList();  // Mettre à jour la liste des points
});

// Fonction pour télécharger l'image annotée
document.getElementById('downloadImage').addEventListener('click', function() {
    const planElement = document.getElementById('plan');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = planElement.width;
    canvas.height = planElement.height;

    // Dessiner l'image du plan sur le canvas
    ctx.drawImage(planElement, 0, 0, canvas.width, canvas.height);

    // Dessiner chaque point sur le canvas
    clickPoints.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'blue';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'white';
        ctx.stroke();
    });

    // Convertir le canvas en image et la télécharger
    const link = document.createElement('a');
    link.download = 'image_annotée.png';
    link.href = canvas.toDataURL();
    link.click();
});

// Fonction pour exporter les données en PDF
document.getElementById('exportPDF').addEventListener('click', function() {
    const pdf = new jsPDF();
    pdf.text('Liste des Points d\'inspection', 10, 10);
    
    clickPoints.forEach((point, index) => {
        pdf.text(`Point ${index + 1}: X=${point.x}, Y=${point.y}`, 10, 20 + index * 10);
    });
    
    pdf.save('points_inspection.pdf');
});
