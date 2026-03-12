from flask import Flask, request, jsonify
import face_recognition
import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
TOLERANCE = float(os.getenv('FACE_RECOGNITION_TOLERANCE', 0.6))

def decode_image(image_data):
    """Decode base64 image to numpy array"""
    try:
        if isinstance(image_data, str):
            image_data = image_data.split(',')[1] if ',' in image_data else image_data
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))
        return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    except Exception as e:
        return None

def get_face_encodings(image):
    """Extract face encodings from image"""
    try:
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_image, model='hog')
        face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
        return face_locations, face_encodings
    except Exception as e:
        print(f"Error extracting face encodings: {e}")
        return [], []

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'AI Service is running'})

@app.route('/recognize', methods=['POST'])
def recognize_faces():
    """
    Recognize faces in classroom image and match with student encodings
    """
    try:
        data = request.json
        classroom_image_data = data.get('image')
        student_encodings = data.get('student_encodings', [])  # List of {studentId, encoding}

        if not classroom_image_data:
            return jsonify({'error': 'No image provided'}), 400

        # Decode classroom image
        classroom_image = decode_image(classroom_image_data)
        if classroom_image is None:
            return jsonify({'error': 'Invalid image format'}), 400

        # Get face locations and encodings from classroom
        face_locations, face_encodings = get_face_encodings(classroom_image)

        if not face_encodings:
            return jsonify({
                'message': 'No faces detected',
                'detectedFaces': []
            })

        detected_faces = []

        # Match each detected face with student encodings
        for face_encoding in face_encodings:
            best_match_id = None
            best_confidence = 0

            for student in student_encodings:
                student_id = student.get('studentId')
                student_encoding_data = student.get('encoding')

                if not student_encoding_data:
                    continue

                try:
                    # Decode student encoding
                    student_encoding = np.frombuffer(
                        base64.b64decode(student_encoding_data),
                        dtype=np.float64
                    )

                    # Compare faces
                    distance = face_recognition.face_distance([student_encoding], face_encoding)[0]
                    confidence = 1 - distance

                    if confidence > best_confidence and distance < TOLERANCE:
                        best_confidence = confidence
                        best_match_id = student_id

                except Exception as e:
                    print(f"Error comparing faces: {e}")
                    continue

            if best_match_id:
                detected_faces.append({
                    'studentId': best_match_id,
                    'confidence': float(best_confidence)
                })

        return jsonify({
            'message': 'Face recognition completed',
            'detectedFaces': detected_faces,
            'totalFacesDetected': len(face_encodings),
            'matchedFaces': len(detected_faces)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/extract-encoding', methods=['POST'])
def extract_encoding():
    """
    Extract face encoding from student image
    """
    try:
        data = request.json
        image_data = data.get('image')

        if not image_data:
            return jsonify({'error': 'No image provided'}), 400

        # Decode image
        image = decode_image(image_data)
        if image is None:
            return jsonify({'error': 'Invalid image format'}), 400

        # Get face encodings
        face_locations, face_encodings = get_face_encodings(image)

        if not face_encodings:
            return jsonify({'error': 'No face detected in image'}), 400

        if len(face_encodings) > 1:
            return jsonify({'error': 'Multiple faces detected. Please provide image with single face'}), 400

        # Encode the face encoding to base64
        encoding_bytes = face_encodings[0].tobytes()
        encoding_b64 = base64.b64encode(encoding_bytes).decode('utf-8')

        return jsonify({
            'message': 'Face encoding extracted successfully',
            'encoding': encoding_b64
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5001))
    app.run(debug=True, port=port)
