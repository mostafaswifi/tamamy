'use client'
import * as turf from '@turf/turf';



const polygon = turf.polygon([[
  [-78, 38], [-77, 38], [-77, 39], [-78, 39], [-78, 38]
]]);

const point = turf.point([-77.5, 38.5]);
const isInside = turf.booleanPointInPolygon(point, polygon);
console.log(isInside ? "Inside safe zone" : "Outside boundary");

const page = () => {
  return (
    <div>
      
    </div>
  )
}

export default page
