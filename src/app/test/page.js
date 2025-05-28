'use client'
import { useEffect } from "react";
import * as turf from '@turf/turf';
import getPlaces from "@/lib/getPlaces";



const polygon = turf.polygon([[
  [-78, 38], [-77, 38], [-77, 39], [-78, 39], [-78, 38]
]]);

const point = turf.point([-77.5, 38.5]);
const isInside = turf.booleanPointInPolygon(point, polygon);
// console.log(isInside ? "Inside safe zone" : "Outside boundary");

const page = () => {
  useEffect(() => {
    let data = async () => {
      let places = await getPlaces()
      console.log(places.map(place => (
        // name: place.name,
        // polygon: turf.polygon(place.polygonPoints.map(point => [point.cordx, point.cordy]))
         place.polygonPoints.map(point => [point.cordx, point.cordy]),
       turf.booleanPointInPolygon(point, polygon)
      )));
    }
    data()
  }, [])

  return (
    <div>
      
    </div>
  )
}

export default page
