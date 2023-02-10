import * as express from 'express';
import { googleMapsClient } from '../../clients/google-maps-client';
import {
  LatLng,
  PlacesNearbyRequest,
} from '@googlemaps/google-maps-services-js';

const router = express.Router();

router.get('/search', async (req, res) => {
  const { zip, cityState, lat, long } = req.query as {
    zip: string;
    cityState: string;
    lat: string;
    long: string;
  };
  console.log(zip, cityState, lat, long);

  //calculate lat and long from zip
  const latLongRequest = {
    params: {
      address: zip,
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
  };
  const latLongResponse = await googleMapsClient.geocode(latLongRequest);
  const latLong = latLongResponse.data.results[0].geometry.location;
  //   const lat = latLong.lat;
  //   const long = latLong.lng;

  const radius = 5000; // Default radius is 10 miles
  const type = 'cafe';

  const locationRequest: PlacesNearbyRequest = {
    params: {
      location: `${lat},${long}`,
      opennow: true,
      type: 'cafe',
      radius: radius,
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
  };
  // Get a list of coffee shops or cafes within the given radius
  const placesResponse = await googleMapsClient.placesNearby(locationRequest);
  const coffeeShops = placesResponse.data.results.map((result) => {
    return {
      name: result.name,
      googlePlaceId: result.place_id,
      vicinity: result.vicinity,
      rating: result.rating,
      googleInformation: { ...result },
    };
  });

  console.log(coffeeShops);
  res.json({ coffeeShops });
});

export default router;
