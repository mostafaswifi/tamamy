import axios from "axios";
const URL_BASE = process.env.NEXT_PUBLIC_API_URL

let getPlaces = async () => {
    let places = await axios.get(`${URL_BASE}/places`)
    return places.data
}

export default getPlaces