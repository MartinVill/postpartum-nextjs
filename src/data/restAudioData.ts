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
    audioUrl: 'https://cttyzkcxy6hbpda6.public.blob.vercel-storage.com/audio/rest/v1/lluvia_suave.m4a',
    imageUrl: '/images/rest/lluvia_suave.jpg'
  },
  {
    id: 'piano',
    title: 'Piano y Calma',
    subtitle: 'Melodía pausada de relajación',
    audioUrl: 'https://cttyzkcxy6hbpda6.public.blob.vercel-storage.com/audio/rest/v1/piano_y_calma.m4a',
    imageUrl: '/images/rest/piano_y_calma.jpg'
  },
  {
    id: 'olas',
    title: 'Olas del Mar',
    subtitle: 'Marea constante y envolvente',
    audioUrl: 'https://cttyzkcxy6hbpda6.public.blob.vercel-storage.com/audio/rest/v1/olas_del_mar.m4a',
    imageUrl: '/images/rest/olas_del_mar.jpg'
  },
  {
    id: 'sueno',
    title: 'Sueño Profundo',
    subtitle: 'Frecuencia baja para descanso',
    audioUrl: 'https://cttyzkcxy6hbpda6.public.blob.vercel-storage.com/audio/rest/v1/sueno_profundo.m4a',
    imageUrl: '/images/rest/sueno_profundo.jpg'
  },
  {
    id: 'envolvente',
    title: 'Sonido Envolvente',
    subtitle: 'Calidez y contención continua',
    audioUrl: 'https://cttyzkcxy6hbpda6.public.blob.vercel-storage.com/audio/rest/v1/sonido_envolvente.m4a',
    imageUrl: '/images/rest/sonido_envolvente.jpg'
  },
  {
    id: 'cuna',
    title: 'Canción de Cuna',
    subtitle: 'Dulce arrope para dormir',
    audioUrl: 'https://cttyzkcxy6hbpda6.public.blob.vercel-storage.com/audio/rest/v1/cancion_de_cuna.m4a',
    imageUrl: '/images/rest/cancion_de_cuna.jpg'
  }
];
