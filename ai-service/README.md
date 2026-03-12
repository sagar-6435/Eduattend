# EduAttend AI Service

Python Flask-based face recognition service for the EduAttend attendance system.

## Features

- Face detection in images
- Face encoding extraction
- Face matching and recognition
- Confidence scoring
- Batch processing support

## Tech Stack

- **Framework**: Flask
- **Computer Vision**: OpenCV
- **Face Recognition**: face_recognition library
- **Image Processing**: Pillow
- **Environment**: python-dotenv

## Installation

### Prerequisites
- Python 3.8+
- pip

### Setup

```bash
cd ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Configuration

Create `.env` file:

```
FLASK_ENV=development
FLASK_PORT=5001
FACE_RECOGNITION_TOLERANCE=0.6
```

**Parameters:**
- `FLASK_ENV`: development or production
- `FLASK_PORT`: Port to run Flask server
- `FACE_RECOGNITION_TOLERANCE`: Face matching threshold (0-1, lower = stricter)

## Running

```bash
python app.py
```

Service will run on `http://localhost:5001`

## API Endpoints

### 1. Health Check
**GET** `/health`

Response:
```json
{
  "status": "AI Service is running"
}
```

### 2. Extract Face Encoding
**POST** `/extract-encoding`

Extract face encoding from a student photo.

Request:
```json
{
  "image": "base64_encoded_image_data"
}
```

Response:
```json
{
  "message": "Face encoding extracted successfully",
  "encoding": "base64_encoded_face_encoding"
}
```

Errors:
- `400` - No image provided
- `400` - Invalid image format
- `400` - No face detected
- `400` - Multiple faces detected

### 3. Recognize Faces
**POST** `/recognize`

Detect and match faces in classroom image.

Request:
```json
{
  "image": "base64_encoded_classroom_image",
  "student_encodings": [
    {
      "studentId": "student_id_1",
      "encoding": "base64_encoded_face_encoding"
    },
    {
      "studentId": "student_id_2",
      "encoding": "base64_encoded_face_encoding"
    }
  ]
}
```

Response:
```json
{
  "message": "Face recognition completed",
  "detectedFaces": [
    {
      "studentId": "student_id_1",
      "confidence": 0.95
    }
  ],
  "totalFacesDetected": 25,
  "matchedFaces": 23
}
```

## How It Works

### Face Encoding Extraction
1. Decode base64 image
2. Convert to RGB format
3. Detect face locations using HOG model
4. Extract face encodings (128-dimensional vectors)
5. Encode to base64 for storage

### Face Recognition
1. Decode classroom image
2. Detect all faces in image
3. Extract encodings for each detected face
4. Compare with student encodings
5. Calculate distance (lower = better match)
6. Return matched students with confidence scores

## Parameters

### Face Detection
- **Model**: HOG (Histogram of Oriented Gradients)
- **Accuracy**: ~99.38% on benchmark dataset
- **Speed**: Fast, suitable for real-time

### Face Matching
- **Tolerance**: 0.6 (default, configurable)
- **Lower tolerance** = stricter matching (fewer false positives)
- **Higher tolerance** = lenient matching (more false positives)

## Image Format

- **Supported**: JPEG, PNG, BMP
- **Encoding**: Base64
- **Size**: Recommended < 5MB
- **Resolution**: Minimum 100x100 pixels per face

## Performance

- **Face Detection**: ~100-200ms per image
- **Face Encoding**: ~50-100ms per face
- **Face Matching**: ~1-2ms per comparison
- **Batch Processing**: Can handle 20-30 faces per image

## Error Handling

All errors return JSON with error message:

```json
{
  "error": "Error description"
}
```

Common errors:
- `400` - Bad request (missing parameters)
- `400` - Invalid image format
- `400` - No face detected
- `500` - Server error

## Optimization Tips

1. **Image Quality**: Ensure good lighting and clear faces
2. **Face Size**: Faces should be at least 100x100 pixels
3. **Angle**: Front-facing photos work best
4. **Batch Size**: Process 20-30 faces per request for optimal performance
5. **Tolerance**: Adjust based on false positive/negative rates

## Troubleshooting

### No faces detected
- Check image quality
- Ensure faces are clearly visible
- Try different lighting
- Increase image resolution

### False positives (wrong matches)
- Lower FACE_RECOGNITION_TOLERANCE
- Ensure student photos are clear
- Use front-facing photos

### False negatives (missed matches)
- Increase FACE_RECOGNITION_TOLERANCE
- Check image quality
- Ensure student encoding is correct

### Slow performance
- Reduce image size
- Reduce number of student encodings
- Use GPU acceleration (if available)

## Deployment

### Heroku
```bash
heroku create eduattend-ai
git push heroku main
```

### Docker
```bash
docker build -t eduattend-ai .
docker run -p 5001:5001 eduattend-ai
```

### Environment Variables
```bash
FLASK_ENV=production
FLASK_PORT=5001
FACE_RECOGNITION_TOLERANCE=0.6
```

## Dependencies

- **face_recognition**: Face detection and encoding
- **opencv-python**: Image processing
- **numpy**: Numerical operations
- **Pillow**: Image handling
- **Flask**: Web framework
- **python-dotenv**: Environment variables

## Limitations

- Single face per student photo (for encoding extraction)
- Requires clear, front-facing photos
- Performance depends on image quality
- Not suitable for masked faces
- Accuracy affected by lighting conditions

## Future Improvements

- GPU acceleration support
- Masked face detection
- Multiple face encoding per student
- Real-time video stream processing
- Confidence threshold adjustment API
- Batch processing optimization

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

MIT
