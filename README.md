# xakaton-bimit-front

## Запуск проекта из docker'а

Минимальный запуск
```
docker run  -v ./config:/var/www/xakaton/dist/config -v ./conf.d:/etc/nginx/conf.d -p 80:80 docker.pkg.github.com/maks-master/xakaton-bimit-front/docker-xakaton-front:work
```

Все параметры
```
docker run  --name docker-xakaton-front --rm -d -v ./logs:/var/log/nginx -v ./config:/var/www/xakaton/dist/config -v ./conf.d:/etc/nginx/conf.d -p 80:80 docker.pkg.github.com/maks-master/xakaton-bimit-front/docker-xakaton-front:work
```


## Сборка проекта

Установить node

Клонируем
```
git clone https://github.com/maks-master/xakaton-bimit-front.git
```
```
cd ./xakaton-bimit-front
```
Сборка

- Настройки проекта
```
npm install
```
- Compiles and hot-reloads for development
```
npm run serve
```
- Compiles and minifies for production
```
npm run build
```
- Lints and fixes files
```
npm run lint
```
- Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

Используем сборку Dockerfile
