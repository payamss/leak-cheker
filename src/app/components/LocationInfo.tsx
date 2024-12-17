type LocationInfoProps = {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
};

const LocationInfo = ({ latitude, longitude, accuracy, timestamp }: LocationInfoProps) => {
  return (
    <div className="text-sm space-y-2">
      <p>
        <strong>Latitude:</strong> {latitude}
      </p>
      <p>
        <strong>Longitude:</strong> {longitude}
      </p>
      <p>
        <strong>Accuracy:</strong> {accuracy} meters
      </p>
      <p>
        <strong>Timestamp:</strong> {timestamp}
      </p>
    </div>
  );
};

export default LocationInfo;
