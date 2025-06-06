'use client'
import { useState } from "react";
import * as turf from '@turf/turf';
import getPlaces from "@/lib/getPlaces";

  
  const [places, setPlaces] = useState([]);
  let pointsArray = [];
  let polygon
  const placesFun = async () => {
    const arrayOfPoints = [];
    let places = await getPlaces()
    const myPlace = []

  places.map(place => {
    myPlace.push(place.points)
  });
  setPlaces(myPlace)
// console.log(places)`
pointsArray = places.map((element,idx) => {
// console.log(idx)
arrayOfPoints.push(element.points.map(point => [point.cordx, point.cordy]))
return [element.points[idx].cordx, element.points[idx].cordy]
}, []);
arrayOfPoints.map((point, idx) => {
  console.log(point)
  
  polygon = turf.polygon([point]);
}
);


const point = turf.point([5,5]);
const isInside = turf.booleanPointInPolygon(point, polygon);

console.log(isInside ? "Inside safe zone" : "Outside boundary");



  }

  export default placesFun