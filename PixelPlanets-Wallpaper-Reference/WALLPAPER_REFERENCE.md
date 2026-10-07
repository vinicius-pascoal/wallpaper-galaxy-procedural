# PixelPlanets – Wallpaper Reference

Este pacote contém somente os arquivos do PixelPlanets necessários como referência para o wallpaper procedural em HTML/JavaScript/WebGL2.

## Incluído
- `Planets/**/*.gdshader`: algoritmos visuais que serão portados para GLSL ES/WebGL2.
- `Planets/**/*.gd`: lógica de seed, tempo, paleta, rotação, iluminação e configuração dos uniforms.
- `Planets/**/*.tscn`: composição original das camadas de cada corpo celeste.
- `GUI/GUI.gd`: referência de seleção/configuração dos tipos de planeta.
- `GUI/ImportExportPopup.gd`: referência do formato de importação/exportação das paletas.
- `project.godot`: referência das configurações do projeto original.
- `README.md` e `LICENSE`: documentação e licença MIT original.

## Removido de propósito
- `.git/` e `.import/`.
- arquivos `.import`.
- imagens, ícones, fonte e tema da interface.
- `gdgifexporter` e lógica de GIF/spritesheet, pois o wallpaper final será 100% procedural em tempo real.
- presets de exportação do Godot.

Este diretório deve ser tratado como `reference/`, não como código final do wallpaper.
