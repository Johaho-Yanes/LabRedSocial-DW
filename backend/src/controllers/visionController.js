import { ImageAnnotatorClient } from '@google-cloud/vision';

const visionClient = new ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

export const visionController = {
  async analyzeFaces(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
      }

      // Analizar la imagen con Cloud Vision API
      const [result] = await visionClient.faceDetection({
        image: { content: req.file.buffer }
      });

      const faces = result.faceAnnotations || [];
      
      // Procesar cada rostro detectado
      const processedFaces = faces.map(face => ({
        emotions: [
          { emotion: 'joy', confidence: face.joyLikelihood },
          { emotion: 'sorrow', confidence: face.sorrowLikelihood },
          { emotion: 'anger', confidence: face.angerLikelihood },
          { emotion: 'surprise', confidence: face.surpriseLikelihood }
        ].map(emotion => ({
          ...emotion,
          confidence: convertLikelihoodToConfidence(emotion.confidence)
        })),
        position: {
          left: face.boundingPoly?.vertices?.[0]?.x || 0,
          top: face.boundingPoly?.vertices?.[0]?.y || 0,
          width: (face.boundingPoly?.vertices?.[2]?.x || 0) - (face.boundingPoly?.vertices?.[0]?.x || 0),
          height: (face.boundingPoly?.vertices?.[2]?.y || 0) - (face.boundingPoly?.vertices?.[0]?.y || 0)
        }
      }));

      return res.json({
        faceCount: faces.length,
        faces: processedFaces
      });
    } catch (error) {
      console.error('Error al analizar la imagen:', error);
      return res.status(500).json({ error: 'Error al procesar la imagen' });
    }
  }
};

// Convierte los valores de probabilidad de Google Vision a valores numéricos
function convertLikelihoodToConfidence(likelihood) {
  const likelihoodMap = {
    VERY_UNLIKELY: 0.1,
    UNLIKELY: 0.3,
    POSSIBLE: 0.5,
    LIKELY: 0.7,
    VERY_LIKELY: 0.9,
    UNKNOWN: 0
  };
  
  return typeof likelihood === 'string' ? likelihoodMap[likelihood] || 0 : 0;
}