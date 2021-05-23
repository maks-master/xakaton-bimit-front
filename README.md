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

Предварительно, положить в conf.d, конфиг xakaton.conf для отдачи статики nginx
```
server {
    listen 80;

    server_name     hakaton.bimit.ru;
    access_log      /var/log/nginx/xakaton.bimit.ru.access.log;
    error_log       /var/log/nginx/xakaton.bimit.ru.error.log;
    #add_header   Access-Control-Allow-Origin *;

    gzip_static  on;
    gzip_proxied expired no-cache no-store private auth;
    gzip             on;
    gzip_comp_level  6;
    gzip_types text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript application/javascript;

    root /var/www/xakaton/dist;


proxy_connect_timeout      6000000;
proxy_send_timeout         6000000;
proxy_read_timeout         6000000;

    client_max_body_size 1024M;

    location / {
        try_files $uri $uri/ /index.html;
    }


}
```
Предварительно, положить в config, конфиг config.js для front
```
var settings = {
  server: {
    url: 'http://IP_ADRES/xakaton/'
  }
}

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
