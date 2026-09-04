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
    subtitle: 'Fina y constante para calmar el ambiente',
    audioUrl: '/audio/rest/lluvia_suave.mp3',
    imageUrl: '/images/rest/lluvia_suave.jpg'
  },
  {
    id: 'piano',
    title: 'Piano y Calma',
    subtitle: 'Melodía lenta y pausada',
    audioUrl: '/audio/rest/piano_y_calma.mp3',
    imageUrl: '/images/rest/piano_y_calma.jpg'
  },
  {
    id: 'olas',
    title: 'Olas del Mar',
    subtitle: 'Ritmo continuo de agua y calma',
    audioUrl: '/audio/rest/olas_del_mar.mp3',
    imageUrl: '/images/rest/olas_del_mar.jpg'
  },
  {
    id: 'sueno',
    title: 'Sueño Profundo',
    subtitle: 'Sonido grave para acallar el ruido exterior',
    audioUrl: '/audio/rest/sueno_profundo.mp3',
    imageUrl: '/images/rest/sueno_profundo.jpg'
  },
  {
    id: 'envolvente',
    title: 'Sonido Envolvente',
    subtitle: 'Continuo y tibio para contención total',
    audioUrl: '/audio/rest/sonido_envolvente.mp3',
    imageUrl: '/images/rest/sonido_envolvente.jpg'
  },
  {
    id: 'cuna',
    title: 'Canción de Cuna',
    subtitle: 'Melodía dulce y arrope para el descanso',
    audioUrl: '/audio/rest/cancion_de_cuna.mp3',
    imageUrl: '/images/rest/cancion_de_cuna.jpg'
  }
];
