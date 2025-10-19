from flask import Flask, request, send_file, render_template, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import cv2
import os
from ultralytics import YOLO

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "https://ag-six.vercel.app/"]}})  # Enable CORS for specific origin

# Paths and parameters (relative to this file)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

model_path = os.path.join(BASE_DIR, 'best.pt')  # Ensure best.pt exists in Crop_Disease/
conf_threshold = 0.25
result_image_path = os.path.join(BASE_DIR, 'result_image.jpg')
labels_output_path = os.path.join(BASE_DIR, 'result.txt')  # Stores detected labels

# Function to perform detection and display the result
def detect_and_display(image_path, model_path, conf_threshold, result_image_path):
    # Load YOLOv8 model
    model = YOLO(model_path)
    
    # Perform detection
    results = model.predict(source=image_path, conf=conf_threshold)
    
    # Get the result image
    result_image = results[0].plot()

    labels = set()  # Using a set to avoid duplicates
    for r in results:
        for box in r.boxes:
            class_id = int(box.cls.item())  # Get class ID
            class_name = model.names[class_id]  # Convert to class name
            labels.add(class_name)
    
    labels_list = list(labels)

    # Save labels to a text file
    with open(labels_output_path, "w") as f:
        for label in labels_list:
            f.write(label + "\n")
    
    # Save the result image
    cv2.imwrite(result_image_path, result_image)
    
    # Display the result
    # cv2.imshow('Detection Result', result_image)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()

    return labels_list

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/getdiseases', methods=['POST'])
def get_diseases():
    if 'image' not in request.files:
        return "No image file found in the request", 400
    
    image_file = request.files['image']
    filename = secure_filename(image_file.filename)
    image_path = os.path.join(UPLOAD_DIR, filename)
    image_file.save(image_path)
    
    detect_and_display(image_path, model_path, conf_threshold, result_image_path)
    
    # Read the disease name from the result.txt file
    with open(labels_output_path, "r") as f:
        disease_name = f.read().strip()
    
    # Send the result image and disease name as a response
    return jsonify({
        'image_url': '/result_image',
        'disease_name': disease_name
    })

@app.route('/result_image')
def result_image():
    return send_file(result_image_path, mimetype='image/jpeg')

if __name__ == '__main__':
    app.run(debug=True, port=5000)  # You can change the port if needed