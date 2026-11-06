from flask import Flask, jsonify, render_template, request, send_from_directory, url_for
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
import os
import time
import json
from disease_solutions import disease_solutions

app = Flask(__name__, static_folder="static")

PROJECT_TITLE = "Plant Disease Diagnosis"
MODEL_DIR = os.path.normpath(os.path.join(app.root_path, os.pardir, "models"))
MODEL_PATH = os.path.join(MODEL_DIR, "model.keras")
CLASS_NAMES_PATH = os.path.join(MODEL_DIR, "class_names.json")
STATIC_DIR = os.path.join(app.root_path, "static")
FRONTEND_DIR = os.path.join(STATIC_DIR, "frontend")

os.makedirs(STATIC_DIR, exist_ok=True)

# Load trained model
model = load_model(MODEL_PATH)

# Map raw model output labels to friendly disease names
# Keys are dataset folder names and must stay aligned with the training class order

disease_map = {
    "Pepper__bell___Bacterial_spot": "Bell Pepper Bacterial Spot",
    "Pepper__bell___healthy": "Bell Pepper Healthy",
    "Potato___Early_blight": "Potato Early Blight",
    "Potato___healthy": "Potato Healthy",
    "Potato___Late_blight": "Potato Late Blight",
    "Tomato_Bacterial_spot": "Tomato Bacterial Spot",
    "Tomato_Early_blight": "Tomato Early Blight",
    "Tomato_Late_blight": "Tomato Late Blight",
    "Tomato_Leaf_Mold": "Tomato Leaf Mold",
    "Tomato_Septoria_leaf_spot": "Tomato Septoria Leaf Spot",
    "Tomato_Spider_mites_Two_spotted_spider_mite": "Tomato Spider Mite",
    "Tomato__Target_Spot": "Tomato Target Spot",
    "Tomato__Tomato_mosaic_virus": "Tomato Mosaic Virus",
    "Tomato__Tomato_YellowLeaf__Curl_Virus": "Tomato Yellow Leaf Curl Virus",
    "Tomato_healthy": "Tomato Healthy"
}

SAFETY_CONFIDENCE_THRESHOLD = 0.65
MIN_HEALTHY_VERSUS_DISEASE_GAP = 0.12


def load_class_names():
    if os.path.exists(CLASS_NAMES_PATH):
        try:
            with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return sorted(disease_map.keys())


class_names = load_class_names()

system_info_texts = {
    "en": {
        "title": "System Info",
        "lines": [
            "Detects plant leaf diseases and healthy crops.",
            "Supports tomato, potato, and bell pepper diagnosis.",
            "Displays symptoms, action steps, and farmer advice."
        ]
    },
    "hi": {
        "title": "सिस्टम जानकारी",
        "lines": [
            "पौधे की पत्ती की बीमारियों और स्वस्थ फसलों का पता लगाता है।",
            "टमाटर, आलू और शिमला मिर्च के निदान का समर्थन करता है।",
            "लक्षण, कार्रवाई के चरण, और किसान सलाह प्रदर्शित करता है।"
        ]
    },
    "kn": {
        "title": "ಸಿಸ್ಟಮ್ ಮಾಹಿತಿ",
        "lines": [
            "ಸಸ್ಯ ಎಲೆ ರೋಗಗಳು ಮತ್ತು ಆರೋಗ್ಯವಾದ ಬೆಳೆಗಳನ್ನು ಪತ್ತೆಹಚ್ಚುತ್ತದೆ.",
            "ಟೊಮೆಟೊ, ಆಲೂ ಮತ್ತು ಬೆಲ್ ಪೆಪ್ಪರ್ ಕೈಗಾರಿಕಾ ರೋಗ ನಿರ್ಣಯವನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ.",
            "ಲಕ್ಷಣಗಳು, ಕ್ರಮಗಳು ಮತ್ತು ರೈತ ಸಲಹೆಯನ್ನು ತೋರಿಸುತ್ತದೆ."
        ]
    },
    "ur": {
        "title": "سسٹم معلومات",
        "lines": [
            "پودے کے پتے کی بیماریوں اور صحت مند فصلوں کا پتہ لگاتا ہے۔",
            "ٹماٹر، آلو، اور بیل مرچ کی تشخیص کی حمایت کرتا ہے۔",
            "علامات، اقدامات، اور کسان کی رہنمائی دکھاتا ہے۔"
        ]
    }
}


def get_disease_solution(disease_class):
    return disease_solutions.get(disease_class)


def is_healthy_class(raw_class_name):
    return "healthy" in raw_class_name.lower()


def get_healthy_confidence(predictions):
    return max(
        (score for score, name in zip(predictions, class_names) if is_healthy_class(name)),
        default=0.0
    )


def format_safe_prediction(raw_class_name, confidence_score, healthy_score, selected_language):
    friendly_label = disease_map.get(raw_class_name, raw_class_name.replace("_", " ").title())
    disease_info = get_disease_solution(friendly_label)
    confidence_pct = round(confidence_score * 100, 2)

    if is_healthy_class(raw_class_name):
        if disease_info:
            language_data = disease_info.get(selected_language, disease_info.get("en"))
            return {
                "prediction": language_data["name"],
                "solution": language_data["solution"],
                "symptoms": language_data["symptoms"],
                "advice": language_data["advice"],
                "status": "Healthy",
                "confidence": confidence_pct
            }
        return {
            "prediction": friendly_label,
            "solution": "This plant appears healthy. Continue regular care and monitor for pests.",
            "symptoms": "No visible disease symptoms detected.",
            "advice": "Keep leaves dry, water at the root zone, and inspect the crop regularly.",
            "status": "Healthy",
            "confidence": confidence_pct
        }

    if healthy_score >= 0.45 and confidence_score - healthy_score < MIN_HEALTHY_VERSUS_DISEASE_GAP:
        return {
            "prediction": "Likely Healthy / Unclear",
            "solution": "The model finds strong healthy evidence and cannot safely confirm disease. Upload another clear leaf photo.",
            "symptoms": "No strong disease pattern was detected in the uploaded image.",
            "advice": "Try a close-up view with good lighting and a plain background.",
            "status": "Needs review",
            "confidence": confidence_pct
        }

    if confidence_score < SAFETY_CONFIDENCE_THRESHOLD:
        return {
            "prediction": "Likely Healthy / Unclear",
            "solution": "The image is not clear enough to confirm a disease. Upload a sharper photo under good lighting.",
            "symptoms": "No strong disease pattern was detected in the uploaded image.",
            "advice": "Use a close-up view of one healthy or affected leaf and avoid blur.",
            "status": "Needs review",
            "confidence": confidence_pct
        }

    if disease_info:
        language_data = disease_info.get(selected_language, disease_info.get("en"))
        return {
            "prediction": language_data["name"],
            "solution": language_data["solution"],
            "symptoms": language_data["symptoms"],
            "advice": language_data["advice"],
            "status": "Disease detected",
            "confidence": confidence_pct
        }

    return {
        "prediction": friendly_label,
        "solution": "Unable to retrieve exact details. Try another clear photo or different leaf angle.",
        "symptoms": "This result is based on model output but detailed recommendations are unavailable.",
        "advice": "Use a bright, focused photo with a clean background for the next attempt.",
        "status": "Disease detected",
        "confidence": confidence_pct
    }


@app.route('/api/predict', methods=['POST'])
def api_predict():
    file = request.files.get('file')
    selected_language = request.form.get('language', 'en')

    if not file or not file.filename:
        return jsonify({'error': 'No image file provided.'}), 400

    filename = str(int(time.time())) + '_' + file.filename
    save_path = os.path.join(STATIC_DIR, filename)
    file.save(save_path)
    img_url = url_for('static', filename=filename)

    img = image.load_img(save_path, target_size=(224, 224), color_mode='rgb')
    img_array = image.img_to_array(img).astype('float32') / 255.0
    img_array = np.clip(img_array, 0, 1)
    img_array = np.expand_dims(img_array, axis=0)

    pred = model.predict(img_array)[0]
    class_index = int(np.argmax(pred))
    raw_class_name = class_names[class_index]
    confidence_score = float(np.max(pred))
    healthy_score = get_healthy_confidence(pred)

    result = format_safe_prediction(raw_class_name, confidence_score, healthy_score, selected_language)
    result['img_url'] = img_url

    return jsonify(result)


@app.route('/frontend/<path:path>')
def frontend_assets(path):
    asset_path = os.path.join(FRONTEND_DIR, path)
    if os.path.exists(asset_path):
        return send_from_directory(FRONTEND_DIR, path)
    return ('', 404)


@app.route('/', defaults={'path': ''}, methods=['GET', 'POST'])
@app.route('/<path:path>', methods=['GET', 'POST'])
def index(path):
    if os.path.exists(os.path.join(FRONTEND_DIR, 'index.html')):
        if path and os.path.exists(os.path.join(FRONTEND_DIR, path)):
            return send_from_directory(FRONTEND_DIR, path)
        return send_from_directory(FRONTEND_DIR, 'index.html')

    prediction = None
    solution = None
    confidence = None
    img_path = None
    symptoms = None
    advice = None
    status = None
    selected_language = 'en'

    if request.method == 'POST':
        file = request.files.get('file')
        selected_language = request.form.get('language', 'en')

        if file and file.filename:
            filename = str(int(time.time())) + '_' + file.filename
            save_path = os.path.join(STATIC_DIR, filename)
            file.save(save_path)
            img_path = url_for('static', filename=filename)

            img = image.load_img(save_path, target_size=(224, 224), color_mode='rgb')
            img_array = image.img_to_array(img).astype('float32') / 255.0
            img_array = np.clip(img_array, 0, 1)
            img_array = np.expand_dims(img_array, axis=0)

            pred = model.predict(img_array)[0]
            class_index = int(np.argmax(pred))
            raw_class_name = class_names[class_index]
            confidence_score = float(np.max(pred))
            healthy_score = get_healthy_confidence(pred)

            result = format_safe_prediction(raw_class_name, confidence_score, healthy_score, selected_language)
            prediction = result['prediction']
            solution = result['solution']
            symptoms = result['symptoms']
            advice = result['advice']
            confidence = result['confidence']
            status = result['status']

    info_data = system_info_texts.get(selected_language, system_info_texts['en'])

    return render_template(
        'index.html',
        project_title=PROJECT_TITLE,
        prediction=prediction,
        solution=solution,
        confidence=confidence,
        img_path=img_path,
        symptoms=symptoms,
        advice=advice,
        status=status,
        selected_language=selected_language,
        info_data=info_data
    )


if __name__ == '__main__':
    app.run(debug=True)
