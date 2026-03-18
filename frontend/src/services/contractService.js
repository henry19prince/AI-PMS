import axios from "axios";

export const uploadContract = async (formData) => {
  const token = localStorage.getItem("access");

  return axios.post(
    "http://127.0.0.1:8000/api/contracts/upload/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getContractSummary = async (id) => {
  const token = localStorage.getItem("access");

  return axios.get(
    `http://127.0.0.1:8000/api/contracts/${id}/summary/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};