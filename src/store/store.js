import {create} from 'zustand';


const locationInitialstate = {
    location: {
        lat: 0,
        lng: 0,
    },
    dateTime: ''
}

export const useLocationDateTimeStore = create((set) => ({
    ...locationInitialstate,
    setLocation: (lat, lng) => set(() => ({location: {lat, lng}})),
    setDateTime: (dateTime) => set(() => ({dateTime})),
}));

