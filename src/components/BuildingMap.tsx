import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import type { Building } from '../data/buildings';

interface Props {
  buildings: Building[];
}

export function BuildingMap({ buildings }: Props) {
  return (
    <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom className="h-[600px] w-full rounded-xl shadow-xl">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {buildings.map((b) => (
        <Marker key={b.id} position={[b.lat, b.lng]}>
          <Popup>
            <div className="space-y-1">
              <h3 className="text-base font-semibold">{b.name}</h3>
              <p>{b.city}, {b.country}</p>
              <p><strong>Height:</strong> {b.heightM} m</p>
              <p><strong>Floors:</strong> {b.floors}</p>
              <p><strong>Completed:</strong> {b.year}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
