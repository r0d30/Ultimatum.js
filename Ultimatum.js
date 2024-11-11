function applyRandomBrightColors() {
    // Check if the <body> contains the "random-coloring" class
    if (!document.body.classList.contains("random-coloring")) {
        return; // Do nothing if the <body> does not have the required class
    }

    // Select all child elements of the body
    const elements = document.querySelectorAll("body *");

    // Function to generate a very bright color
    function getRandomBrightColor() {
        const r = Math.floor(150 + Math.random() * 105); // Values between 150 and 255
        const g = Math.floor(150 + Math.random() * 105);
        const b = Math.floor(150 + Math.random() * 105);
        return `rgb(${r}, ${g}, ${b})`;
    }

    // Apply a background color to each element that doesn't already have a "background-color" set
    elements.forEach(element => {
        const currentBgColor = window.getComputedStyle(element).backgroundColor;
        
        // Check if the background color is user-defined (not the default "rgba(0, 0, 0, 0)")
        if (currentBgColor === "rgba(0, 0, 0, 0)" || !element.style.backgroundColor) {
            element.style.backgroundColor = getRandomBrightColor();
        }
    });
}

// Call the function to apply the colors
applyRandomBrightColors();

// Throttle function to limit the frequency of execution
function throttle(func, delay) {
    let lastCall = 0;
    return function (...args) {
        const now = new Date().getTime();
        if (now - lastCall < delay) return;
        lastCall = now;
        return func(...args);
    };
}

// Debounce function to execute the function after a delay once the event ends
function debounce(func, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    };
}

// Utility function to display logs only if 'body' contains the 'logs' class
function logIfEnabled(message) {
    if (document.body.classList.contains("logs")) {
        console.log(message);
    }
}

// Main positioning function
function applyCustomPositions() {
    // Select all elements with custom CSS properties `--x-pos` or `--y-pos`
    const elements = Array.from(document.querySelectorAll("*")).filter(element => {
        const computedStyle = getComputedStyle(element);
        return computedStyle.getPropertyValue("--x-pos").trim() || computedStyle.getPropertyValue("--y-pos").trim();
    });

    logIfEnabled(`Number of elements found with 'x-pos' or 'y-pos': ${elements.length}`);

    elements.forEach(element => {
        const computedStyle = getComputedStyle(element);
        const xPos = computedStyle.getPropertyValue('--x-pos').trim();
        const yPos = computedStyle.getPropertyValue('--y-pos').trim();

        logIfEnabled(`x-pos attributes: ${xPos}, y-pos: ${yPos}`);

        element.style.position = "absolute";
        logIfEnabled("absolute position applied to the element");

        const parent = element.parentElement;
        const parentWidth = parent.clientWidth;
        const parentHeight = parent.clientHeight;
        const elementWidth = element.offsetWidth;
        const elementHeight = element.offsetHeight;

        logIfEnabled(`Parent dimensions - Width: ${parentWidth}, Height: ${parentHeight}`);
        logIfEnabled(`Element dimensions - Width: ${elementWidth}, Height: ${elementHeight}`);

        let translateX = 0;
        let translateY = 0;

        if (xPos === "start") {
            translateX = 0;
        } else if (xPos === "center") {
            translateX = (parentWidth - elementWidth) / 2;
        } else if (xPos === "end") {
            translateX = parentWidth - elementWidth;
        }

        if (yPos === "start") {
            translateY = 0;
        } else if (yPos === "center") {
            translateY = (parentHeight - elementHeight) / 2;
        } else if (yPos === "end") {
            translateY = parentHeight - elementHeight;
        }

        let transformValue = "";
        if (xPos) {
            transformValue += `translateX(${translateX}px) `;
        }
        if (yPos) {
            transformValue += `translateY(${translateY}px)`;
        }

        if (transformValue) {
            element.style.transform = transformValue.trim();
            logIfEnabled(`Transformation applied: ${transformValue.trim()}`);
        } else {
            logIfEnabled("No transformation applied as no arguments are defined.");
        }
    });
}

// Apply position calculations on page load
window.addEventListener("DOMContentLoaded", applyCustomPositions);
window.addEventListener("load", applyCustomPositions);

// Apply position calculations with throttle during window resize
window.addEventListener("resize", throttle(applyCustomPositions, 50));

// Apply a final adjustment with debounce after resizing ends
window.addEventListener("resize", debounce(applyCustomPositions, 200));

class OverlayCanvas extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // Create the checkbox to enable/disable the overlay
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('overlay-toggle');
        
        // Create the image for the overlay
        const img = document.createElement('img');
        img.src = this.className.split(' ')[0]; // Use the first class name as the image path
        img.classList.add('overlay-image');

        // Get the Y class for vertical translation
        const yClass = this.className.split(' ').find(cls => cls.startsWith('Y'));
        let translateYValue = 0;

        if (yClass) {
            translateYValue = parseInt(yClass.slice(1), 10);
        }

        // Get the opacity class
        const opacityClass = this.className.split(' ').find(cls => cls.startsWith('opacity-'));
        let opacityValue = 0.5; // Default value

        if (opacityClass) {
            const opacityPercentage = opacityClass.split('-')[1].replace('%', '');
            opacityValue = parseInt(opacityPercentage, 10) / 100; // Convert to percentage
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
                opacity: ${opacityValue}; /* Apply opacity */
                display: none;
                z-index: 999;
                pointer-events: none;
                transform: translateY(${translateYValue}px);
            }
            .overlay-toggle:checked + .overlay-image {
                display: block;
            }
        `;

        // Listen for checkbox change to show/hide the image
        checkbox.addEventListener('change', () => {
            img.style.display = checkbox.checked ? 'block' : 'none';
        });

        // Append style, checkbox, and image to shadow DOM
        this.shadowRoot.append(style, checkbox, img);
    }
}

// Define the custom element <overlay-canvas>
customElements.define('overlay-canvas', OverlayCanvas);

class AButton extends HTMLElement {
    constructor() {
        super();

        // Attach shadow DOM to encapsulate content and style
        this.attachShadow({ mode: 'open' });

        // Apply styles directly to the custom tag
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

        // Attach styles to shadow DOM
        this.shadowRoot.appendChild(style);

        // Create an <a> element to encapsulate the content and handle navigation
        const anchor = document.createElement('a');
        anchor.setAttribute('href', this.getAttribute('href') || '#');
        anchor.setAttribute('target', this.getAttribute('target') || '_self');

        // Use slot to allow content injection into the tag
        const slot = document.createElement('slot');
        anchor.appendChild(slot);
        this.shadowRoot.appendChild(anchor);

        // Listen for clicks to handle navigation
        this.addEventListener('click', (e) => {
            const target = e.target;
            if (target.tagName.toLowerCase() === 'a') {
                window.location.href = target.getAttribute('href');
            }
        });
    }
}

// Register the custom <a-button> element
customElements.define('a-button', AButton);
