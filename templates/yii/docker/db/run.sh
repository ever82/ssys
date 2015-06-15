cd "$(dirname "$0")"
docker rm -f ssystest_db
docker run -d --name ssystest_db -p 3306:3306 -v $PWD/../../protected/data/schema.mysql.sql:/tmp/startup.sql -e MYSQL_PASS="aaaa" -e STARTUP_SQL="/tmp/startup.sql" tutum/mysql