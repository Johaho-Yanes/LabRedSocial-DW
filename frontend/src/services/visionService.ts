import api from '../lib/api';

export interface FaceAnalysisResult {
  faceCount: number;
  faces: {
    emotions: {
      emotion: string;
      confidence: number;
    }[];
    position: {
      left: number;
      top: number;
      width: number;
      height: number;
    };
  }[];
}

export const visionService = {
  async analyzeFaces(imageFile: File): Promise<FaceAnalysisResult> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post('/vision/analyze-faces', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }
};