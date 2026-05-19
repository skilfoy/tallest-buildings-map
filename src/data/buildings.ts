export type BuildingStatus = 'completed' | 'topped-out' | 'under-construction';

export interface Building {
  id: string;
  name: string;
  city: string;
  country: string;
  heightM: number;
  floors: number;
  year: number;
  lat: number;
  lng: number;
  status: BuildingStatus;
}

export const buildings: Building[] = [
  { id: 'burj-khalifa', name: 'Burj Khalifa', city: 'Dubai', country: 'UAE', heightM: 828, floors: 163, year: 2010, lat: 25.1972, lng: 55.2744, status: 'completed' },
  { id: 'merdeka-118', name: 'Merdeka 118', city: 'Kuala Lumpur', country: 'Malaysia', heightM: 678.9, floors: 118, year: 2023, lat: 3.139, lng: 101.6995, status: 'completed' },
  { id: 'shanghai-tower', name: 'Shanghai Tower', city: 'Shanghai', country: 'China', heightM: 632, floors: 128, year: 2015, lat: 31.2336, lng: 121.5055, status: 'completed' },
  { id: 'makkah-clock', name: 'Makkah Royal Clock Tower', city: 'Mecca', country: 'Saudi Arabia', heightM: 601, floors: 120, year: 2012, lat: 21.4225, lng: 39.8262, status: 'completed' },
  { id: 'ping-an', name: 'Ping An Finance Center', city: 'Shenzhen', country: 'China', heightM: 599.1, floors: 115, year: 2017, lat: 22.5333, lng: 114.0554, status: 'completed' },
  { id: 'lotte-world-tower', name: 'Lotte World Tower', city: 'Seoul', country: 'South Korea', heightM: 555.7, floors: 123, year: 2017, lat: 37.5125, lng: 127.1025, status: 'completed' },
  { id: 'one-world-trade', name: 'One World Trade Center', city: 'New York', country: 'USA', heightM: 541.3, floors: 104, year: 2014, lat: 40.7127, lng: -74.0134, status: 'completed' },
  { id: 'guangzhou-ctf', name: 'Guangzhou CTF Finance Centre', city: 'Guangzhou', country: 'China', heightM: 530, floors: 111, year: 2016, lat: 23.1181, lng: 113.3248, status: 'completed' },
  { id: 'tianjin-ctf', name: 'Tianjin CTF Finance Centre', city: 'Tianjin', country: 'China', heightM: 530, floors: 98, year: 2019, lat: 39.1013, lng: 117.2166, status: 'completed' },
  { id: 'citic-tower', name: 'CITIC Tower', city: 'Beijing', country: 'China', heightM: 527.7, floors: 109, year: 2018, lat: 39.9117, lng: 116.4562, status: 'completed' },
  { id: 'taipei-101', name: 'Taipei 101', city: 'Taipei', country: 'Taiwan', heightM: 508, floors: 101, year: 2004, lat: 25.0339, lng: 121.5645, status: 'completed' },
  { id: 'shanghai-wfc', name: 'Shanghai World Financial Center', city: 'Shanghai', country: 'China', heightM: 492, floors: 101, year: 2008, lat: 31.2364, lng: 121.5016, status: 'completed' },
];
