import axios from "axios";
const URL_BASE = process.env.NEXT_PUBLIC_API_URL

const addPlace = async (schoolName, points) => {
  if (!points) {
    return;
  }
  console.log(schoolName);
  const data = {
    name: schoolName,
    points: points,
  };

  try {
    await axios.post(`${URL_BASE}/places`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer your_token", // If needed
      },
    });
  } catch (error) {
    console.error("Error adding place:", error);
  }
}

export default addPlace;