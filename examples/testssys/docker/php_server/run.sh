cd "$(dirname "$0")"
docker rm -f testssys_yii
sudo rm -R -f ../../protected/runtime
sudo mkdir ../../protected/runtime
sudo touch ../../protected/runtime/debug.log
sudo touch ../../protected/runtime/application.log
sudo chmod -R 777 ../../protected/runtime/

docker run -d -p 81:80 --name testssys_yii --link testssys_db:db -v $PWD/test.html:/var/www/html/index.html -v $PWD/../../:/var/www/testssys/ -v $PWD/../../index.dev.html:/var/www/testssys/index.html -v $PWD/apache2.conf:/etc/apache2/apache2.conf -v $PWD/httpd-vhosts.conf:/etc/apache2/extra/httpd-vhosts.conf -v $PWD/../../../../src/frontend/js/:/var/www/ssys/ -v $PWD/../../../../src/backend/php/yii/ssys/:/var/www/testssys/protected/extensions/ssys/ -v $PWD/php.ini:/usr/local/etc/php/php.ini --env-file=env.list ever82/testssys_yii