#!/bin/bash
KEY="/home/rus/Downloads/labsuser.pem"
scp -i "$KEY" -r ./dist/* deploy@54.209.66.250:/var/www/html/

if [ $? -eq 0 ]; then
    echo "✅ Деплой прошел успешно!"
else
    echo "❌ Ошибка деплоя."
fi
