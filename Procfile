web: cd $NODEJS_ROOT && npm install && npm run build && npm run start
web: gunicorn 'backend.app:create_app()'
