export interface AudioTrack {
  id: string;
  title: string;
  subtitle: string;
  audioUrl: string;
  imageUrl: string;
}

export const REST_AUDIO_TRACKS: AudioTrack[] = [
  {
    id: 'lluvia',
    title: 'Lluvia Suave',
    subtitle: 'Lluvia serena y constante',
    audioUrl: '/audio/rest/lluvia_suave.mp3',
    imageUrl: '/images/rest/lluvia_suave.jpg'
  },
  {
    id: 'piano',
    title: 'Piano y Calma',
    subtitle: 'Melodía pausada de relajación',
    audioUrl: '/audio/rest/piano_y_calma.mp3',
    imageUrl: '/images/rest/piano_y_calma.jpg'
  },
  {
    id: 'olas',
    title: 'Olas del Mar',
    subtitle: 'Marea constante y envolvente',
    audioUrl: '/audio/rest/olas_del_mar.mp3',
    imageUrl: '/images/rest/olas_del_mar.jpg'
  },
  {
    id: 'sueno',
    title: 'Sueño Profundo',
    subtitle: 'Frecuencia baja para descanso',
    audioUrl: '/audio/rest/sueno_profundo.mp3',
    imageUrl: '/images/rest/sueno_profundo.jpg'
  },
  {
    id: 'envolvente',
    title: 'Sonido Envolvente',
    subtitle: 'Calidez y contención continua',
    audioUrl: '/audio/rest/sonido_envolvente.mp3',
    imageUrl: '/images/rest/sonido_envolvente.jpg'
  },
  {
    id: 'cuna',
    title: 'Canción de Cuna',
    subtitle: 'Dulce arrope para dormir',
    audioUrl: '/audio/rest/cancion_de_cuna.mp3',
    imageUrl: '/images/rest/cancion_de_cuna.jpg'
  }
];
