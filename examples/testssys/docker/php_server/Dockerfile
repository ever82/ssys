FROM php:5.6-apache
RUN a2enmod rewrite
RUN apt-get update && apt-get install -y \
        wget \
        libfreetype6-dev \
        libjpeg62-turbo-dev \
        libmcrypt-dev \
        libpng12-dev \
    && docker-php-ext-install iconv mcrypt pdo pdo_mysql exif \
    && docker-php-ext-configure gd --with-freetype-dir=/usr/include/ --with-jpeg-dir=/usr/include/ \
    && docker-php-ext-install gd 
RUN wget https://github.com/yiisoft/yii/releases/download/1.1.16/yii-1.1.16.bca042.tar.gz
RUN tar -xf yii-1.1.16.bca042.tar.gz 
RUN mv yii-1.1.16.bca042/framework framework
RUN rm -Rf yii-1.1.16.bca042
RUN rm -f yii-1.1.16.bca042.tar.gz
RUN wget https://phar.phpunit.de/phpunit.phar
RUN chmod +x phpunit.phar
RUN mv phpunit.phar /usr/local/bin/phpunit
