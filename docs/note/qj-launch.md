```shell
docker pull redis:7
docker run -d -p 6379:6379 --name qj-redis -v /docker/qj-redis/conf/redis.conf:/etc/redis/redis.conf -v /docker/qj-redis/data/:/data redis:7 redis-server /etc/redis/redis.conf

docker pull mysql:8.0.31

docker run -d --name qj-mysql -p 3306:3306  -v /docker/qj-mysql/data:/var/lib/mysql -v  /docker/qj-mysql/log:/var/log/mysql --privileged=true -e TZ="Asia/Shanghai" -e MYSQL_ROOT_PASSWORD=  mysql:8

docker run -d --name qj-nginx -p 80:80 -v /docker/qj-nginx/conf/nginx.conf:/etc/nginx/nginx.conf -v /docker/qj-nginx/log:/var/log/nginx -v /docker/qj-nginx/html:/usr/share/nginx/html -e TZ="Asia/Shanghai"  nginx

docker run -d --name qj-rabbitmq -p 15672:15672 -p 5672:5672 -v /docker/qj-rabbitmq/data:/var/lib/rabbitmq  -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=  -e TZ="Asia/Shanghai" --privileged=true rabbitmq:3-management



```