import axiosClient from './axiosClient';

const reviewApi = {
  // Get all reviews (Admin)
  getAllReviews() {
    const url = '/admin/reviews';
    return axiosClient.get(url);
  },

  // Delete a review (Admin)
  deleteReview(reviewId) {
    const url = `/admin/reviews/${reviewId}`;
    return axiosClient.delete(url);
  },
};

export default reviewApi;
