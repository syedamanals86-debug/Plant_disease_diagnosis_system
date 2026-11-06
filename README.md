# Plant Disease Diagnosis System

This project uses a Flask backend with a modern React + Tailwind frontend for plant disease detection.

## Run the frontend
1. Install Node.js and npm if they are not already available.
2. Open a terminal in the `frontend` folder.
3. Install dependencies:
   ```bash
   npm install
   ```ntend:
   ```bash
4. Build the production fro
   npm run build
   ```

The build will output to `app/static/frontend`, which the Flask backend serves automatically.

## Run the backend
1. Install Python dependencies using the provided requirements file:
   ```bash
   pip install -r requirments.txt
   ```
2. Start the Flask server:
   ```bash
   python app/app.py
   ```
3. Open the app in your browser at `http://127.0.0.1:5000`.

## Development notes
- The frontend is built with React, Tailwind CSS, and Framer Motion.
- The Flask backend exposes an API endpoint at `/api/predict`.
- Uploaded images are saved to `app/static/` for preview and result display.
