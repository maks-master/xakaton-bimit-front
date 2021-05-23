FROM nginx:1.20-alpine

RUN if ! [ -d /var/www ]; then  mkdir /var/www; fi && \
    if ! [ -d /var/www/xakaton ]; then  mkdir /var/www/xakaton; fi


COPY dist /var/www/xakaton/dist
COPY version /var/www/xakaton/dist/

VOLUME ["/etc/nginx/conf.d"]
