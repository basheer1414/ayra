# AYRA - AI Photo Editor

Welcome to AYRA, a powerful, web-based photo editor that leverages Google's Gemini AI to bring your creative visions to life. Edit your images using simple, intuitive text prompts. Whether you're making precise touch-ups, applying stylistic filters, or performing professional-grade adjustments, AYRA makes advanced photo editing accessible to everyone.

## Features

- **Retouch:** Make precise, localized edits. Simply click on any part of your image and describe the change you want to see. The AI will seamlessly blend your edit into the surrounding area.
  - *Example: Click on a t-shirt and type "change the shirt color to bright red."*
- **Adjust:** Apply global, photorealistic adjustments to your entire image. Choose from professional presets or describe your own custom adjustment.
  - *Presets: Blur Background, Enhance Details, Warmer Lighting, Studio Light.*
  - *Example: Type "make the entire image feel like a vintage photograph."*
- **Filters:** Instantly transform the look and feel of your photos with creative filters. Apply a preset style or invent your own.
  - *Presets: Synthwave, Anime, Lomography, Glitch.*
  - *Example: Type "apply a dreamy, watercolor painting effect."*
- **Crop:** Easily crop your images to focus on what matters. Select from common aspect ratios like 1:1 and 16:9, or crop freely.
- **Non-destructive Workflow:** Your original image is always safe. Experiment freely with a complete history system.
  - **Undo/Redo:** Step backward and forward through your edits using the compact buttons below the image.
  - **Compare:** Press and hold the "Compare" button to quickly see the original.
- **Download:** Save your masterpiece to your device with a single click of the Download icon at the top-right of the canvas.

## How to Use

1.  **Upload an Image:** Drag and drop an image file into the main canvas area on the right, or click the "Select Image" button to choose a file from your device.
2.  **Choose a Tool:** In the left-hand sidebar, select an editing mode from the tabs: `Retouch`, `Adjust`, `Filters`, or `Crop`.
3.  **Apply Your Edit:**
    - For **Retouch**, click a point on the image to set the edit location, then type your desired change into the text box at the bottom of the sidebar and click "Generate".
    - For **Adjust** or **Filters**, select one of the preset buttons or type a custom description in the sidebar and click "Apply".
    - For **Crop**, use the controls in the sidebar to set an aspect ratio, then click and drag on the image to create a selection. Click "Apply Crop" in the action bar below the image when you're done.
4.  **Review and Refine:** Use the `Undo`, `Redo`, and `Compare` buttons located in the action bar below the image to review your changes.
5.  **Download:** Once you are happy with your edits, click the `Download` icon at the top-right corner of the canvas to save the final result. You can also upload a `New` image using the icon in this corner.

## Tech Stack

-   **Frontend:** React, TypeScript, Tailwind CSS, Styled Components
-   **AI Model:** Google Gemini API (`gemini-2.5-flash-image`)
-   **Core Libraries:** `react-image-crop`

## License

This project is licensed under the Apache License, Version 2.0. See the `LICENSE` file for details.