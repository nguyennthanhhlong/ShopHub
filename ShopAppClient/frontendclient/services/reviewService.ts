import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export interface ReviewDTO {
  reviewId: number;
  rating: number;
  comment: string;
  createdAt: string;
  userEmail: string;
  userName: string;
  userImage: string;
  productId: number;
}

export interface ReviewRequest {
  rating: number;
  comment: string;
}

export const getReviewsByProduct = async (productId: number) => {
  return await axios.get<ReviewDTO[]>(`${API_BASE_URL}/public/products/${productId}/reviews`);
};

export const addReview = async (productId: number, email: string, reviewRequest: ReviewRequest, token: string) => {
  return await axios.post<ReviewDTO>(
    `${API_BASE_URL}/user/products/${productId}/reviews?email=${email}`,
    reviewRequest,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};
