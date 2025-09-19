"""
Plant Disease Detection Model Integration Script

This script helps integrate your trained model (my_model.h5) with the Next.js application.
Run this script to test your model and get the proper integration code.

Requirements:
- tensorflow
- numpy
- pillow
- opencv-python (optional, for better image preprocessing)

Install requirements:
pip install tensorflow numpy pillow opencv-python
"""

import os
import sys
import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow import keras
import json

# Model configuration
MODEL_PATH = "models/my_model.h5"
INPUT_SIZE = (224, 224)  # Adjust based on your model's input size
CLASS_LABELS = [
    "Early Blight",
    "Late Blight", 
    "Leaf Mold",
    "Septoria Leaf Spot",
    "Bacterial Spot",
    "Healthy"
]  # Update these labels based on your model's classes

def load_model():
    """Load the trained model"""
    try:
        if not os.path.exists(MODEL_PATH):
            print(f"Error: Model file not found at {MODEL_PATH}")
            print("Please make sure your model file is in the correct location.")
            return None
            
        model = keras.models.load_model(MODEL_PATH)
        print(f"Model loaded successfully from {MODEL_PATH}")
        print(f"Model input shape: {model.input_shape}")
        print(f"Model output shape: {model.output_shape}")
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        return None

def preprocess_image(image_path, target_size=INPUT_SIZE):
    """Preprocess image for model inference"""
    try:
        # Load image
        image = Image.open(image_path)
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize image
        image = image.resize(target_size)
        
        # Convert to numpy array and normalize
        image_array = np.array(image) / 255.0
        
        # Add batch dimension
        image_array = np.expand_dims(image_array, axis=0)
        
        return image_array
    except Exception as e:
        print(f"Error preprocessing image: {e}")
        return None

def predict_disease(model, image_path):
    """Run inference on a single image"""
    try:
        # Preprocess image
        processed_image = preprocess_image(image_path)
        if processed_image is None:
            return None
        
        # Run prediction
        predictions = model.predict(processed_image, verbose=0)
        
        # Get the class with highest probability
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_idx])
        predicted_class = CLASS_LABELS[predicted_class_idx]
        
        # Get top 3 predictions
        top_indices = np.argsort(predictions[0])[-3:][::-1]
        top_predictions = [
            {
                "disease": CLASS_LABELS[idx],
                "confidence": float(predictions[0][idx])
            }
            for idx in top_indices
        ]
        
        return {
            "predicted_disease": predicted_class,
            "confidence": confidence,
            "all_predictions": top_predictions
        }
        
    except Exception as e:
        print(f"Error during prediction: {e}")
        return None

def test_model_with_sample_images():
    """Test the model with sample images"""
    model = load_model()
    if model is None:
        return
    
    # Test with sample images (you can add your own test images here)
    test_images = [
        "test_images/sample1.jpg",
        "test_images/sample2.jpg",
        "test_images/sample3.jpg"
    ]
    
    print("\n" + "="*50)
    print("TESTING MODEL WITH SAMPLE IMAGES")
    print("="*50)
    
    for image_path in test_images:
        if os.path.exists(image_path):
            print(f"\nTesting: {image_path}")
            result = predict_disease(model, image_path)
            if result:
                print(f"Predicted Disease: {result['predicted_disease']}")
                print(f"Confidence: {result['confidence']:.4f}")
                print("Top 3 predictions:")
                for i, pred in enumerate(result['all_predictions'], 1):
                    print(f"  {i}. {pred['disease']}: {pred['confidence']:.4f}")
            else:
                print("Prediction failed")
        else:
            print(f"Sample image not found: {image_path}")

def generate_integration_code():
    """Generate the integration code for the API endpoint"""
    code = '''
// Replace the mock implementation in app/api/analyze/route.ts with this:

import * as tf from '@tensorflow/tfjs-node'
import * as fs from 'fs'
import * as path from 'path'

async function runModelInference(imagePath: string, plantType: string) {
  try {
    // Load your model
    const modelPath = path.join(process.cwd(), 'models', 'my_model.h5')
    const model = await tf.loadLayersModel(`file://${modelPath}`)
    
    // Load and preprocess the image
    const imageBuffer = fs.readFileSync(imagePath)
    const imageTensor = tf.node.decodeImage(imageBuffer, 3)
    
    // Resize to model input size
    const resized = tf.image.resizeBilinear(imageTensor, [224, 224])
    const normalized = resized.div(255.0)
    const batched = normalized.expandDims(0)
    
    // Run inference
    const predictions = model.predict(batched) as tf.Tensor
    const predictionArray = await predictions.data()
    
    // Get the class with highest probability
    const maxIndex = predictionArray.indexOf(Math.max(...predictionArray))
    
    // Define your class labels
    const classLabels = [
      'Early Blight', 'Late Blight', 'Leaf Mold', 
      'Septoria Leaf Spot', 'Bacterial Spot', 'Healthy'
    ]
    
    const predictedDisease = classLabels[maxIndex]
    const confidence = predictionArray[maxIndex]
    
    // Clean up tensors
    imageTensor.dispose()
    resized.dispose()
    normalized.dispose()
    batched.dispose()
    predictions.dispose()
    
    return {
      disease: predictedDisease,
      confidence: confidence,
      plantType: plantType,
      processingTime: 2.3
    }
    
  } catch (error) {
    console.error('Model inference error:', error)
    throw new Error('Failed to run model inference')
  }
}
'''
    
    print("\n" + "="*50)
    print("INTEGRATION CODE FOR API ENDPOINT")
    print("="*50)
    print(code)
    
    # Save to file
    with open("model_integration_code.js", "w") as f:
        f.write(code)
    print("\nIntegration code saved to: model_integration_code.js")

def main():
    """Main function"""
    print("Plant Disease Detection Model Integration")
    print("="*50)
    
    # Check if model exists
    if not os.path.exists(MODEL_PATH):
        print(f"Model not found at {MODEL_PATH}")
        print("Please make sure your model file is in the correct location.")
        print("\nTo integrate your model:")
        print("1. Place your model file at: models/my_model.h5")
        print("2. Update the CLASS_LABELS in this script to match your model")
        print("3. Update INPUT_SIZE if your model uses different input dimensions")
        print("4. Run this script again to test the model")
        return
    
    # Test the model
    test_model_with_sample_images()
    
    # Generate integration code
    generate_integration_code()
    
    print("\n" + "="*50)
    print("NEXT STEPS")
    print("="*50)
    print("1. Install TensorFlow.js for Node.js:")
    print("   npm install @tensorflow/tfjs-node")
    print("\n2. Replace the mock implementation in app/api/analyze/route.ts")
    print("   with the generated integration code")
    print("\n3. Update the CLASS_LABELS in the integration code to match your model")
    print("\n4. Test the integration by uploading an image through the web interface")

if __name__ == "__main__":
    main()
