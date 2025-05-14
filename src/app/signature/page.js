'use client'
import { useState, useEffect } from 'react'
import {useGeolocated} from "react-geolocated";
import {format} from 'date-fns';
import { useLocationDateTimeStore } from '../../store/store.js';

const now = new Date();


const Signature = () => {
let dateTimeSignature = format(now, 'dd/MM/yyyy HH:mm:ss');
  const {location, setLocation, dateTime, setDateTime} = useLocationDateTimeStore();

    const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated();
  
    const [isClient, setIsClient] = useState(false)
 
  useEffect(() => {
    setIsClient(true)
    setLocation(coords?.latitude, coords?.longitude)
    setDateTime(dateTimeSignature)
  }, [coords, dateTime,dateTimeSignature,setDateTime,setLocation])
    

  return (
    <div>
      
   
   {location.lat}
   <br />
   {location.lng}
   <br />
   {dateTime}
    </div>
  )
}

export default Signature
