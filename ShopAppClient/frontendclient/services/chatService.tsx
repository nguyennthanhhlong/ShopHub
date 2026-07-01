import axiosClient from '@/libraryService/axiosClient';

export async function askAI(question: string): Promise<string> {
  try {
    const response = await axiosClient.post('/ai/ask', question, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 120000, // 2 minutes for slow AI responses
    });

    // Spring Boot trả về String trong response.data
    return response.data;
  } catch (error: any) {
    throw new Error(
      'Lỗi khi gọi AI service: ' + (error.response?.data || error.message)
    );
  }
}
