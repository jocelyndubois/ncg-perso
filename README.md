# NodeCG - Perso.

NE PAS UTILISER CE BUNDLE. Il est à des fin personnelles et il ne vous apportera rien :)

## Docs :
- [NodeCG](https://nodecg.dev/)

## Requirements
- NodeCG v1.x
- Node.js v8.3 minimum
- npm v2 minimum
- nodecg-cli
- bower

## Pré-installation:
Si vous n'avez pas encore d'instance de nodecg d'installée :

1. Téléchargez et installez bower si ce n'est pas déjà fait.
```shell
npm install --global bower
```
2. Téléchargez et installez nodecg-cli si ce n'est pas déjà fait.
```shell
npm install --global nodecg-cli
```
3. Créez un nouveau dossier et initialisez nodecg
```shell
mkdir nodecg
cd nodecg
nodecg setup
```

## Installation :
1. `nodecg install jocelyndubois/ncg-perso`.
2. 
```
   cd bundles/ncg-perso
   nodecg defaultconfig
   cd ../../
```
3. Editez le fichier ncg-perso.json dans le dossier cfg à la racine de nodecg et renseignez vos informations.
4. `nodecg start`
5. Si vous souhaitez utiliser le mode "pops", ajoutez une image `pop.png` dans `bundles/ncg-perso/graphics/img/`

## Utilisation
Pour utiliser nodecg, `nodecg start` dans le dossier racine de nodecg.
