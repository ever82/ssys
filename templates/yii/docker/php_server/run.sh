cd "$(dirname "$0")"
docker rm -f ssystest_yii
sudo rm -R -f ../../protected/runtime
sudo mkdir ../../protected/runtime
sudo chmod -R 777 ../../protected/runtime/
sudo chmod -R 777 ../../uploader/
docker run -d -p 80:80 --name ssystest_yii --link ssystest_db:db -v $PWD/test.html:/var/www/html/index.html -v $PWD/../../:/var/www/ssystest/ -v $PWD/../../index.dev.html:/var/www/ssystest/index.html -v $PWD/apache2.conf:/etc/apache2/apache2.conf -v $PWD/httpd-vhosts.conf:/etc/apache2/extra/httpd-vhosts.conf -v $PWD/../../../ssys/src/:/var/www/ssys/ -v $PWD/php.ini:/usr/local/etc/php/php.ini --env-file=env.list ever82/ssystest_yii