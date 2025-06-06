'use client'
import {useEffect, useState } from "react";
import * as turf from '@turf/turf';
import getPlaces from "@/lib/getPlaces";
import employeeLogIn from "../../lib/emloyeeLogIn";







// console.log(isInside ? "Inside safe zone" : "Outside boundary");

const page =  () => {
  




useEffect(() => {
  const fetchData = async () => {
    let employee = await employeeLogIn()
    console.log(employee)
  }
  fetchData()
}, [])

  // const [myplace, setMyplace] = useState([]);


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
}, []);
let result = arrayOfPoints.map((point, idx) => {
  // console.log(point)
  
  polygon = turf.polygon([point]);
 return turf.booleanPointInPolygon([31.781735673060943,30.34309281339179], polygon)
}
);
console.log(result)
// console.log(arrayOfPoints)
console.log(places)
let school = result.map((element, idx) => {
  if (element === true) {
    return places[idx]
  }
})
school = school.filter((element) => element !== undefined)
console.log(school)
return result;



// console.log(arrayOfPoints)





// const point = turf.point([5,5]);
// const isInside = turf.booleanPointInPolygon(point, polygon);

// console.log(isInside ? "Inside safe zone" : "Outside boundary");
}

  return (
    <div>
      <button onClick={() => placesFun()}>placesFun</button>
      <button onClick={() => console.log( )}>mmmm</button>
    </div>
  )
}

export default page
