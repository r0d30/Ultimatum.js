This JavaScript library introduces several features for dynamic page manipulation, including:

1. Random Bright Color Backgrounds: 
   The `applyRandomBrightColors()` function applies random bright background colors to all elements in the body that don't already have a background color set. It first checks if the body contains the class "random-coloring" before proceeding. The color generation ensures vibrant hues by limiting the RGB values between 150 and 255.

2. Throttle and Debounce Utilities:
   - **Throttle**: The `throttle()` function limits the frequency of function execution, useful for optimizing performance during events like window resizing. It ensures that a function is only called after a specified delay, even if the event is triggered multiple times.
   - **Debounce**: The `debounce()` function ensures that a function is executed only once after a specified delay, triggering the function once the event ends, preventing excessive execution during continuous events like typing or resizing.

3. Conditional Logging:
   The `logIfEnabled()` function logs messages to the console only if the body contains the class "logs". This allows for controlled debugging without cluttering the console in production environments.

4. Custom Element Positioning:
   - The `applyCustomPositions()` function dynamically positions elements based on custom CSS properties (`--x-pos` and `--y-pos`). It calculates the position of the elements in relation to their parent, supporting values like "start", "center", and "end" for both X and Y axes. The function supports throttling and debouncing during window resizing, ensuring smooth updates.

5. Overlay Canvas:
   - The `OverlayCanvas` custom element creates an overlay that can be toggled on or off using a checkbox. It uses the first class name as the image source and supports vertical translation (`Y` classes) and opacity adjustments. The overlay appears when the checkbox is checked, providing a useful visual layer for applications like measurement overlays.

6. Custom `<a-button>` Element:
   - The `AButton` custom element styles an anchor (`<a>`) inside a button-like component with a shadow DOM, encapsulating both the style and functionality. It provides an interactive button with hover and active states, and supports dynamic content injection through slots. Additionally, the button handles navigation, making it ideal for use in single-page applications or interactive interfaces.
