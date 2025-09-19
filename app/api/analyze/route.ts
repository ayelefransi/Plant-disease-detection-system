import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { writeFile, unlink } from "fs/promises"
import { join } from "path"
import { tmpdir } from "os"

// Import TensorFlow.js for model inference
// Note: You'll need to install @tensorflow/tfjs-node
// npm install @tensorflow/tfjs-node

export async function POST(request: NextRequest) {
  try {
    console.log("Analysis request received")
    
    // Check authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: "Authentication failed", details: authError.message }, { status: 401 })
    }
    
    if (!user) {
      console.error("No user found")
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    console.log("User authenticated:", user.id)

    const formData = await request.formData()
    const file = formData.get("image") as File
    const plantType = formData.get("plantType") as string

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 })
    }
    
    if (!plantType) {
      return NextResponse.json({ error: "No plant type provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type. Please upload an image." }, { status: 400 })
    }

    console.log("Processing file:", file.name, "Plant type:", plantType)

    // Save uploaded file temporarily
    const bytes = await file.arrayBuffer()
    const buffer = new Uint8Array(bytes)
    const tempPath = join(tmpdir(), `plant-${Date.now()}-${file.name}`)
    await writeFile(tempPath, buffer)

    try {
      // Load and run the model
      console.log("Running model inference...")
      const prediction = await runModelInference(tempPath, plantType)
      console.log("Model inference completed:", prediction)
      
      // Clean up temporary file
      await unlink(tempPath)

      // Try to save prediction to database
      console.log("Saving to database...")
      let predictionData = null
      
      try {
        const { data, error: dbError } = await supabase
          .from("predictions")
          .insert({
            user_id: user.id,
            image_url: `temp-${Date.now()}`, // Temporary URL since we're not storing images yet
            plant_type: plantType,
            predicted_disease: prediction.disease,
            confidence_score: prediction.confidence,
            status: "completed",
          })
          .select()
          .single()

        if (dbError) {
          console.warn("Database save failed (tables may not exist):", dbError.message)
          // Create a mock prediction data for testing
          predictionData = {
            id: `temp-${Date.now()}`,
            user_id: user.id,
            image_url: `temp-${Date.now()}`,
            plant_type: plantType,
            predicted_disease: prediction.disease,
            confidence_score: prediction.confidence,
            status: "completed",
            created_at: new Date().toISOString()
          }
        } else {
          predictionData = data
          console.log("Prediction saved successfully:", predictionData)
        }
      } catch (dbError) {
        console.warn("Database connection failed:", dbError)
        // Create a mock prediction data for testing
        predictionData = {
          id: `temp-${Date.now()}`,
          user_id: user.id,
          image_url: `temp-${Date.now()}`,
          plant_type: plantType,
          predicted_disease: prediction.disease,
          confidence_score: prediction.confidence,
          status: "completed",
          created_at: new Date().toISOString()
        }
      }

      return NextResponse.json({
        success: true,
        prediction: predictionData,
        analysis: prediction
      })

    } catch (modelError) {
      // Clean up temporary file on error
      await unlink(tempPath).catch(() => {})
      console.error("Model error:", modelError)
      throw modelError
    }

  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}

async function runModelInference(imagePath: string, plantType: string) {
  // For now, we'll use a mock implementation
  // In production, you would load your actual model here
  
  // Reject obviously unrelated images using a very light color heuristic
  // If the image lacks sufficient green dominance, ask for a leaf image
  try {
    const fs = await import("fs")
    const sharp = (await import("sharp")).default
    const img = sharp(imagePath).resize(64, 64, { fit: "cover" }).removeAlpha()
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
    let greenish = 0
    let total = 0
    for (let i = 0; i < data.length; i += 3) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const saturation = max === 0 ? 0 : (max - min) / max
      if (g > r + 12 && g > b + 12 && saturation > 0.15) greenish++
      total++
    }
    const ratio = total ? greenish / total : 0
    if (ratio < 0.18) {
      return {
        disease: "Unrelated",
        confidence: 0,
        plantType,
        processingTime: 0.5,
        rejectReason: "not_leaf"
      }
    }
  } catch {
    // If sharp isn't available, silently skip server-side validation
  }

  // Mock disease predictions based on plant type
  const diseaseMap = {
    tomato: [
      { name: "Early Blight", confidence: 0.89 },
      { name: "Late Blight", confidence: 0.76 },
      { name: "Leaf Mold", confidence: 0.82 },
      { name: "Septoria Leaf Spot", confidence: 0.71 },
      { name: "Bacterial Spot", confidence: 0.68 },
      { name: "Healthy", confidence: 0.95 },
    ],
    potato: [
      { name: "Early Blight", confidence: 0.87 },
      { name: "Late Blight", confidence: 0.91 },
      { name: "Healthy", confidence: 0.93 },
    ],
    pepper: [
      { name: "Bacterial Spot", confidence: 0.84 },
      { name: "Healthy", confidence: 0.88 },
    ],
  }

  const diseases = diseaseMap[plantType as keyof typeof diseaseMap] || diseaseMap.tomato
  const randomDisease = diseases[Math.floor(Math.random() * diseases.length)]

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000))

  return {
    disease: randomDisease.name,
    confidence: randomDisease.confidence,
    plantType: plantType,
    processingTime: 2.3
  }
}

// TODO: Replace the mock implementation above with actual model inference
// Here's how you would integrate your actual model:

/*
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
    
    // Resize to model input size (adjust based on your model)
    const resized = tf.image.resizeBilinear(imageTensor, [224, 224])
    const normalized = resized.div(255.0)
    const batched = normalized.expandDims(0)
    
    // Run inference
    const predictions = model.predict(batched) as tf.Tensor
    const predictionArray = await predictions.data()
    
    // Get the class with highest probability
    const maxIndex = predictionArray.indexOf(Math.max(...predictionArray))
    
    // Define your class labels (adjust based on your model)
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
*/
