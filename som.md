# Integração de áudio

O wallpaper usa a API opcional de áudio do Wallpaper Engine através de
`window.wallpaperRegisterAudioListener(callback)`. O callback pode fornecer um
Array ou TypedArray com o spectrum; a quantidade de bins é detectada em tempo de
execução e dividida em cinco bandas normalizadas.

Em navegador comum, ou quando a API não estiver disponível, o estado de áudio
fica em zero e o universo continua animando normalmente. O parâmetro de teste
`?audioTest=true` simula bandas apenas para desenvolvimento.

O processamento está isolado em `src/wallpaper/WallpaperAudio.js`; shaders e
objetos celestes não acessam a API global diretamente. O estado é suavizado com
attack/release e limitado antes de chegar ao renderer para evitar flicker.
