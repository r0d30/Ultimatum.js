(function() {
    // Détection de l'emplacement du fichier JavaScript (Ultimatum.js)
    const scriptElement = document.currentScript;
    const scriptSrc = scriptElement.src;
    const scriptPath = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));

    // Créer une nouvelle balise <link> pour Ultimatum.css
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = `${scriptPath}/Ultimatum.css`;  // Utilise le même chemin que Ultimatum.js

    // Ajouter la balise <link> au <head> du document
    document.head.appendChild(linkElement);
})();



class OverlayCanvas extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // Création de la checkbox pour activer/désactiver l'overlay
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('overlay-toggle');
        
        // Création de l'image pour l'overlay
        const img = document.createElement('img');
        img.src = this.className.split(' ')[0]; // Utilise le premier nom de classe comme chemin de l'image
        img.classList.add('overlay-image');

        // Récupère la classe Y pour la translation verticale
        const yClass = this.className.split(' ').find(cls => cls.startsWith('Y'));
        let translateYValue = 0;

        if (yClass) {
            translateYValue = parseInt(yClass.slice(1), 10);
        }

        // Récupère la classe pour l'opacité
        const opacityClass = this.className.split(' ').find(cls => cls.startsWith('opacity-'));
        let opacityValue = 0.5; // Valeur par défaut

        if (opacityClass) {
            const opacityPercentage = opacityClass.split('-')[1].replace('%', '');
            opacityValue = parseInt(opacityPercentage, 10) / 100; // Convertit en pourcentage
        }

        const style = document.createElement('style');
        style.textContent = `
            .overlay-toggle {
                position: absolute;
                top: 5px;
                left: 5px;
                z-index: 1000;
                width: 10px;
                height: 10px;
            }
            .overlay-image {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: auto;
                opacity: ${opacityValue}; /* Appliquer l'opacité */
                display: none;
                z-index: 999;
                pointer-events: none;
                transform: translateY(${translateYValue}px);
            }
            .overlay-toggle:checked + .overlay-image {
                display: block;
            }
        `;

        // Écoute les changements de la checkbox pour afficher/masquer l'image
        checkbox.addEventListener('change', () => {
            img.style.display = checkbox.checked ? 'block' : 'none';
        });

        // Ajoute le style, la checkbox et l'image au shadow DOM
        this.shadowRoot.append(style, checkbox, img);
    }
}

// Déclare la balise personnalisée <overlay-canvas>
customElements.define('overlay-canvas', OverlayCanvas);


class AButton extends HTMLElement {
    constructor() {
        super();

        // Attacher le shadow DOM pour encapsuler le contenu et le style
        this.attachShadow({ mode: 'open' });

        // Appliquer des styles directement à la balise custom
        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: inline-flex;
                justify-content: center;
                align-items: center;
                background-color: #efefef;
                border: solid #767676 1px;
                border-radius: 3px;
                font-family: Arial;
                font-size: 13.3333px;
                padding: 2px 7px;
                margin: 0;
                box-sizing: border-box;
                text-decoration: none;
                color: inherit;
                cursor: pointer;
                width: auto;
                height: auto;
                vertical-align: middle;
            }
            :host(:hover) {
                background-color: #e5e5e5;
                border-color: #4f4f4f;
            }
            :host(:active) {
                background-color: #efefef;
                border-color: #767676;
            }
            a {
                display: inline-flex;
                justify-content: center;
                align-items: center;
                padding: 0;
                margin: 0;
                text-decoration: none;
                color: inherit;
                width: 100%;
                height: 100%;
            }
        `;

        // Attacher les styles au shadow DOM
        this.shadowRoot.appendChild(style);

        // Créer un élément <a> pour encapsuler le contenu et gérer la navigation
        const anchor = document.createElement('a');
        anchor.setAttribute('href', this.getAttribute('href') || '#');
        anchor.setAttribute('target', this.getAttribute('target') || '_self');

        // Utilisation du slot pour permettre d'injecter du contenu dans la balise
        const slot = document.createElement('slot');
        anchor.appendChild(slot);
        this.shadowRoot.appendChild(anchor);

        // Détecter le clic sur l'élément pour rediriger
        this.addEventListener('click', this.navigate.bind(this));
    }

    // Fonction de navigation
    navigate(event) {
        event.preventDefault(); // Empêche la navigation par défaut
        const href = this.getAttribute('href') || '#';
        const target = this.getAttribute('target') || '_self';

        // Empêche l'ouverture multiple du lien si déjà ouvert
        if (!this.alreadyOpened) {
            window.open(href, target);
            this.alreadyOpened = true;
        }

        // Réinitialiser après un court délai pour autoriser de nouvelles ouvertures ultérieures
        setTimeout(() => {
            this.alreadyOpened = false;
        }, 1000);  // Ajuster le délai selon le besoin
    }

    // Observer les attributs href et target pour des mises à jour dynamiques
    static get observedAttributes() {
        return ['href', 'target'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.updateAttributes();
        }
    }

    updateAttributes() {
        const anchor = this.shadowRoot.querySelector('a');
        anchor.setAttribute('href', this.getAttribute('href') || '#');
        anchor.setAttribute('target', this.getAttribute('target') || '_self');
    }
}

// Définir notre balise <a-button>
customElements.define('a-button', AButton);


class CardinalDiv extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // Appliquer du style externe avec slot
        const style = document.createElement('style');
        style.textContent = `
            :host {
                position: relative;
                display: block;
            }
            .cardinal-content {
                position: relative;
                width: 100%;
                height: 100%;
            }
        `;
        this.shadowRoot.appendChild(style);

        // Contenu
        const slot = document.createElement('slot');
        slot.classList.add('cardinal-content');
        this.shadowRoot.appendChild(slot);
    }

    connectedCallback() {
        this.positionCardinalChildren();

        // Recalculer toutes les 5 secondes
        this.updateInterval = setInterval(() => {
            this.positionCardinalChildren();
        }, 1000);
    }

    disconnectedCallback() {
        clearInterval(this.updateInterval);  // Nettoyer l'intervalle lors du retrait du DOM
    }

    positionCardinalChildren() {
        const customWidth = this.offsetWidth;
        const customHeight = this.offsetHeight;
        const children = this.querySelectorAll(':scope > *');

        console.log(`Taille de la balise custom (width: ${customWidth}, height: ${customHeight})`);

        children.forEach(child => {
            const width = child.offsetWidth;
            const height = child.offsetHeight;

            console.log(`\nÉlément enfant trouvé: ${child.tagName}`);
            console.log(`Taille de l'enfant (width: ${width}, height: ${height})`);
            console.log(`Classes de l'enfant: ${child.className}`);

            const cardinalClass = Array.from(child.classList).find(cls =>
                ['north', 'south', 'east', 'west', 'north-east', 'north-west', 'south-east', 'south-west', 'equator']
                .includes(cls)
            );

            if (cardinalClass) {
                console.log(`Classe cardinale trouvée: ${cardinalClass}`);
                child.style.position = 'absolute';

                switch (cardinalClass) {
                    case 'north':
                        child.style.top = '0';
                        child.style.left = `${customWidth / 2 - width / 2}px`;
                        break;
                    case 'south':
                        child.style.bottom = '0';
                        child.style.left = `${customWidth / 2 - width / 2}px`;
                        break;
                    case 'east':
                        child.style.top = `${customHeight / 2 - height / 2}px`;
                        child.style.right = '0';
                        break;
                    case 'west':
                        child.style.top = `${customHeight / 2 - height / 2}px`;
                        child.style.left = '0';
                        break;
                    case 'equator':
                        child.style.top = `${customHeight / 2 - height / 2}px`;
                        child.style.left = `${customWidth / 2 - width / 2}px`;
                        break;
                    case 'north-east':
                        child.style.top = '0';
                        child.style.right = '0';
                        break;
                    case 'north-west':
                        child.style.top = '0';
                        child.style.left = '0';
                        break;
                    case 'south-east':
                        child.style.bottom = '0';
                        child.style.right = '0';
                        break;
                    case 'south-west':
                        child.style.bottom = '0';
                        child.style.left = '0';
                        break;
                    default:
                        break;
                }
            }

            // Vérification des classes de translation avec la correction de l'expression régulière
            const translateClass = Array.from(child.classList).find(cls =>
                /\((-?\d+(px|%)|P-?\d+%),(-?\d+(px|%)|P-?\d+%)\)/.test(cls)
            );

            if (translateClass) {
                console.log(`Classe de translation trouvée: ${translateClass}`);
                const translateValues = translateClass.match(/\(([^,]+),([^)]+)\)/);
                if (translateValues) {
                    const translateX = this.calculateTranslate(translateValues[1], customWidth, width);
                    const translateY = this.calculateTranslate(translateValues[2], customHeight, height);

                    // Appliquer la transformation
                    console.log(`Translation calculée - X: ${translateX}, Y: ${translateY}`);
                    child.style.transform = `translate(${translateX}, ${translateY})`;
                } else {
                    console.error(`Erreur lors de l'extraction des valeurs de translation pour ${translateClass}`);
                }
            } else {
                console.log(`Aucune classe de translation trouvée pour cet enfant`);
            }
        });
    }

    // Méthode pour calculer les translations
    calculateTranslate(value, parentSize, childSize) {
        if (value.includes('P')) {
            const percentage = parseFloat(value.replace('P', '').replace('%', ''));
            return `${(parentSize * percentage / 100) - (childSize / 2)}px`;
        } else if (value.includes('%')) {
            const percentage = parseFloat(value.replace('%', ''));
            return `${(childSize * percentage / 100) - (childSize / 2)}px`;
        } else if (value.includes('px')) {
            return value;
        }
        return '0px';
    }
}

// Déclarer la balise <cardinal-div>
customElements.define('cardinal-div', CardinalDiv);

