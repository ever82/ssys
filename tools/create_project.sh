#!/bin/bash
docker rm -f $1
docker run --name $1 -v $project_dir:/var/www/project ever82/ssys_yii create_project $1