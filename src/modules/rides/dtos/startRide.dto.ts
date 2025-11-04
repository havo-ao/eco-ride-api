export interface StartRideDTO {
  userId: number;
  bikeId: number;
  originStationId: number;
  type: 'Last Mile' | 'Long Ride';
}