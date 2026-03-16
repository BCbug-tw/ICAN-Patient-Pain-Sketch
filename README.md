# Patient Pain Sketch Marking Tool

This is a simple web tool to allow patients to mark pain locations on a PROMs PDF document.

## Features
- Displays `PROMs.pdf` in the browser.
- Allows users to click on the PDF to mark locations with an "X".
- Supports clearing all marks.
- Exports the marked document as a new PDF.

## How to Run Locally

You can run this project using any simple static file server.

### using npx (Node.js)

1.  Make sure you have Node.js installed.
2.  Open a terminal in this directory.
3.  Run the following command:
    ```bash
    npx http-server . -o
    ```
    This will start a local server and open the page in your default browser.

### using Python

If you have Python installed:
```bash
python -m http.server
```
Then visit `http://localhost:8000`.

## Deployment with ngrok

If you want to share this local server with others (e.g., for testing on a different device or showing a client), you can use [ngrok](https://ngrok.com/).

1.  Start your local server (e.g., `npx http-server -p 8080`).
2.  In a new terminal window, run ngrok pointing to that port:
    ```bash
    ngrok http 8080
    ```
3.  Copy the `https://...ngrok-free.app` URL provided by ngrok and send it to the user.

## Files
- `index.html`: Main interface.
- `style.css`: Styling.
- `script.js`: Application logic.
- `PROMs.pdf`: The source PDF file.
