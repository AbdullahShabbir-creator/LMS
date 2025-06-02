import React from "react";

const PaymentModal = ({ course, onClose, onSuccess, loading }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-600 hover:text-black text-2xl"
        >
          &times;
        </button>

        {/* Modal Content */}
        <h2 className="text-xl font-bold mb-4">Enroll in {course.name}</h2>
        <p className="mb-4">{course.description}</p>

        <button
          onClick={onSuccess}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Enrolling..." : "Confirm Enrollment"}
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;
