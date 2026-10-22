export type Station = { id: string; name: string; region: string };
export type Stop = { station: string; arrival: string; departure: string };
export type Journey = {
  id: string; origin: string; destination: string; departure: string; arrival: string;
  duration: number; fare: number; service: string; changes: number; stops: Stop[];
};
export const stations: Station[] = [
  { id: 'kl-sentral', name: 'KL Sentral', region: 'Kuala Lumpur' },
  { id: 'ipoh', name: 'Ipoh', region: 'Perak' },
  { id: 'butterworth', name: 'Butterworth', region: 'Penang' },
  { id: 'alor-setar', name: 'Alor Setar', region: 'Kedah' },
  { id: 'sungai-petani', name: 'Sungai Petani', region: 'Kedah' },
  { id: 'gemas', name: 'Gemas', region: 'Negeri Sembilan' },
  { id: 'jb-sentral', name: 'JB Sentral', region: 'Johor' },
  { id: 'seremban', name: 'Seremban', region: 'Negeri Sembilan' },
];
export const journeys: Journey[] = [
  { id:'rf-101', origin:'KL Sentral', destination:'Ipoh', departure:'08:05', arrival:'10:31', duration:146, fare:25.5, service:'Intercity North', changes:0, stops:[{station:'KL Sentral',arrival:'—',departure:'08:05'},{station:'Tanjung Malim',arrival:'09:14',departure:'09:16'},{station:'Kampar',arrival:'10:02',departure:'10:04'},{station:'Ipoh',arrival:'10:31',departure:'—'}]},
  { id:'rf-102', origin:'KL Sentral', destination:'Ipoh', departure:'10:40', arrival:'13:20', duration:160, fare:22, service:'Northern Express', changes:0, stops:[{station:'KL Sentral',arrival:'—',departure:'10:40'},{station:'Rawang',arrival:'11:19',departure:'11:21'},{station:'Kampar',arrival:'12:42',departure:'12:44'},{station:'Ipoh',arrival:'13:20',departure:'—'}]},
  { id:'rf-103', origin:'KL Sentral', destination:'Ipoh', departure:'14:15', arrival:'16:37', duration:142, fare:29, service:'Intercity North', changes:0, stops:[{station:'KL Sentral',arrival:'—',departure:'14:15'},{station:'Tanjung Malim',arrival:'15:19',departure:'15:21'},{station:'Ipoh',arrival:'16:37',departure:'—'}]},
  { id:'rf-201', origin:'Butterworth', destination:'KL Sentral', departure:'09:00', arrival:'13:08', duration:248, fare:58, service:'Coastal Express', changes:0, stops:[{station:'Butterworth',arrival:'—',departure:'09:00'},{station:'Taiping',arrival:'10:22',departure:'10:24'},{station:'Ipoh',arrival:'11:10',departure:'11:13'},{station:'KL Sentral',arrival:'13:08',departure:'—'}]},
  { id:'rf-202', origin:'Butterworth', destination:'KL Sentral', departure:'12:20', arrival:'16:41', duration:261, fare:52, service:'Coastal Express', changes:0, stops:[{station:'Butterworth',arrival:'—',departure:'12:20'},{station:'Taiping',arrival:'13:44',departure:'13:46'},{station:'Ipoh',arrival:'14:30',departure:'14:33'},{station:'KL Sentral',arrival:'16:41',departure:'—'}]},
  { id:'rf-301', origin:'KL Sentral', destination:'JB Sentral', departure:'07:30', arrival:'11:42', duration:252, fare:45, service:'Southern Link', changes:1, stops:[{station:'KL Sentral',arrival:'—',departure:'07:30'},{station:'Seremban',arrival:'08:38',departure:'08:40'},{station:'Gemas',arrival:'10:05',departure:'10:20'},{station:'JB Sentral',arrival:'11:42',departure:'—'}]},
  { id:'rf-401', origin:'Alor Setar', destination:'Butterworth', departure:'11:10', arrival:'12:29', duration:79, fare:16, service:'Northern Express', changes:0, stops:[{station:'Alor Setar',arrival:'—',departure:'11:10'},{station:'Sungai Petani',arrival:'11:47',departure:'11:49'},{station:'Butterworth',arrival:'12:29',departure:'—'}]},
  { id:'rf-402', origin:'Sungai Petani', destination:'KL Sentral', departure:'08:45', arrival:'13:12', duration:267, fare:49, service:'Coastal Express', changes:0, stops:[{station:'Sungai Petani',arrival:'—',departure:'08:45'},{station:'Butterworth',arrival:'09:22',departure:'09:25'},{station:'Ipoh',arrival:'11:06',departure:'11:09'},{station:'KL Sentral',arrival:'13:12',departure:'—'}]}
];
export const formatDuration = (minutes: number) => `${Math.floor(minutes / 60)}h ${minutes % 60 ? `${minutes % 60}m` : ''}`.trim();
