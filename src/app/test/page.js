'use client'
import { useEffect, useState } from "react";
import * as turf from '@turf/turf';
import getPlaces from "@/lib/getPlaces";
import { set } from "date-fns";








// console.log(isInside ? "Inside safe zone" : "Outside boundary");

const page = () => {









  const [pointsArray, setPointsArray] = useState([]);

const placesFun = async () => {
  let places = await getPlaces()
  let myplace = []
  places.map(place => {
    myplace = place.points
   
});
let pointsArray = myplace.map(element => {
  
 return [element.cordx, element.cordy]
});

setPointsArray(pointsArray)

console.log( pointsArray)



const polygon = turf.polygon([pointsArray]);

const point = turf.point([5,5]);
const isInside = turf.booleanPointInPolygon(point, polygon);

console.log(isInside ? "Inside safe zone" : "Outside boundary");
}

  return (
    <div>
      <button onClick={() => placesFun()}>placesFun</button>
    </div>
  )
}

export default page
