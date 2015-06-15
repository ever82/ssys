cd /var/www
mkdir $1
fmpp -S /var/www/ssys/templates/yii -O /var/www/$1 -D "project_name:$1"
